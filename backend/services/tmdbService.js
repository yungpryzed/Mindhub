// FILE: backend/services/tmdbService.js
class tmdbService {
  static async searchMovies(query) {
    if (!process.env.TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY_MISSING");
    }

    const url = new URL("https://api.themoviedb.org/3/search/movie");
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "it-IT");

    const apiKey = process.env.TMDB_API_KEY.trim();
    const isBearer = apiKey.startsWith("ey") || apiKey.length > 40;

    if (!isBearer) {
      url.searchParams.set("api_key", apiKey);
    }

    const response = await fetch(url, {
      headers: isBearer
        ? {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`TMDB_API_ERROR:${response.status}:${errorBody}`);
    }

    const data = await response.json();
    return data.results || [];
  }
}

module.exports = tmdbService;