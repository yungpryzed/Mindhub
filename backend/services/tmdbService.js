// FILE: backend/services/tmdbService.js
class tmdbService {
  static async searchMulti(query) {
    if (!process.env.TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY_MISSING");
    }

    const apiKey = process.env.TMDB_API_KEY.trim();
    const isBearer = apiKey.startsWith("ey") || apiKey.length > 40;
    const getHeaders = () => isBearer
      ? { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

    const getQueryString = (urlObj) => {
      if (!isBearer) {
        urlObj.searchParams.set("api_key", apiKey);
      }
      return urlObj;
    };

    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "true");
    url.searchParams.set("language", "it-IT");
    getQueryString(url);

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`TMDB_API_ERROR:${response.status}:${errorBody}`);
    }

    const data = await response.json();
    let results = data.results || [];

    // Filtro strict per escludere 'person'
    results = results.filter(item => item.media_type !== 'person');

    // Hydration concorrente
    const hydratedResults = await Promise.all(results.map(async (item) => {
      const type = item.media_type === 'tv' ? 'tv' : 'movie';
      const detailsUrl = new URL(`https://api.themoviedb.org/3/${type}/${item.id}`);
      detailsUrl.searchParams.set("language", "it-IT");
      
      const providersUrl = new URL(`https://api.themoviedb.org/3/${type}/${item.id}/watch/providers`);
      
      const [detailsRes, providersRes] = await Promise.all([
        fetch(getQueryString(detailsUrl), { headers: getHeaders() }),
        fetch(getQueryString(providersUrl), { headers: getHeaders() })
      ]);

      const details = detailsRes.ok ? await detailsRes.json() : {};
      const providersData = providersRes.ok ? await providersRes.json() : {};
      
      let duration = null;
      if (type === 'movie' && details.runtime) {
        duration = details.runtime;
      } else if (type === 'tv' && details.episode_run_time && details.episode_run_time.length > 0) {
        duration = details.episode_run_time[0];
      }

      let platforms = [];
      const itProviders = providersData.results?.IT;
      if (itProviders && itProviders.flatrate) {
        platforms = itProviders.flatrate.map(p => ({
          provider_name: p.provider_name,
          logo_path: p.logo_path
        }));
      }

      // Normalizzazione contratto JSON
      return {
        id: item.id,
        title: type === 'movie' ? item.title : (item.name || item.original_name),
        media_type: type,
        rating: Math.round((item.vote_average || 0) * 10) / 10,
        duration: duration,
        platforms: platforms,
        poster_path: item.poster_path,
        overview: item.overview,
        release_date: type === 'movie' ? item.release_date : item.first_air_date
      };
    }));

    return hydratedResults;
  }
}

module.exports = tmdbService;