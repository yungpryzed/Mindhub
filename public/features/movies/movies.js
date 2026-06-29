let domRef = null;
let tmdbSearchRef = null;
let createContentRef = null;
let getParentIdRef = null;
let onContentCreatedRef = null;
let setCreateErrorRef = null;

const resetMovieSearchUI = () => {
  if (!domRef) return;
  domRef.movieResults.innerHTML = "";
  domRef.movieQuery.value = "";
};

const createMovieContent = async (payload, title) => {
  if (!createContentRef || !getParentIdRef || !setCreateErrorRef || !onContentCreatedRef) return;

  try {
    const parent_id = getParentIdRef() === "root" ? null : getParentIdRef();
    await createContentRef({
      type: "movie",
      title: title || payload.title || "(senza titolo)",
      tags: [],
      payload,
      parent_id,
    });

    resetMovieSearchUI();
    domRef.createForm.classList.add("d-none");
    onContentCreatedRef();
  } catch (error) {
    setCreateErrorRef(error.message || "Errore di rete");
  }
};

const runMovieSearch = async (query) => {
  if (!domRef || !tmdbSearchRef || !setCreateErrorRef) return;

  domRef.movieResults.innerHTML = "";

  if (!query) {
    setCreateErrorRef("Inserisci un titolo da cercare.");
    return;
  }

  try {
    const data = await tmdbSearchRef(query);

    if (!Array.isArray(data.results)) {
      setCreateErrorRef(data.message || "Errore nella ricerca TMDB.");
      return;
    }

    // FIX UX: Se la ricerca ha successo, puliamo eventuali messaggi di errore precedenti
    setCreateErrorRef("");

    data.results.slice(0, 8).forEach((movie) => {
      const year = movie.release_date ? `(${movie.release_date.slice(0, 4)})` : "";
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      
      const titleSpan = document.createElement("span");
      titleSpan.className = "text-truncate";
      titleSpan.textContent = `${movie.title} ${year}`.trim();

      const badgeContainer = document.createElement("div");
      badgeContainer.className = "d-flex gap-2 align-items-center flex-shrink-0";
      
      const mediaTypeBadge = document.createElement("span");
      mediaTypeBadge.className = "glass-text";
      mediaTypeBadge.style.fontSize = "0.65rem";
      mediaTypeBadge.style.padding = "0.2rem 0.4rem";
      mediaTypeBadge.textContent = movie.media_type === 'tv' ? "Serie TV / Anime" : "Film";
      
      const ratingBadge = document.createElement("span");
      ratingBadge.className = "glass-text";
      ratingBadge.style.fontSize = "0.65rem";
      ratingBadge.style.padding = "0.2rem 0.4rem";
      ratingBadge.innerHTML = `<i class="bi bi-star-fill" style="color: #F5C518;"></i> ${movie.rating ? movie.rating.toFixed(1) : "0.0"}`;
      
      badgeContainer.appendChild(mediaTypeBadge);
      badgeContainer.appendChild(ratingBadge);
      
      item.appendChild(titleSpan);
      item.appendChild(badgeContainer);
      
      item.addEventListener("click", () => {
        const payload = {
          tmdb_id: movie.id,
          title: movie.title,
          media_type: movie.media_type,
          overview: movie.overview,
          release_date: movie.release_date,
          
          poster_path: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : "https://via.placeholder.com/500x750?text=No+Poster",
            
          vote_average: movie.rating,
          runtime: movie.duration,
          platforms: movie.platforms
        };
        
        createMovieContent(payload, movie.title || "");
      });
      domRef.movieResults.appendChild(item);
    });
  } catch (error) {
    setCreateErrorRef("Errore di rete TMDB.");
  }
};

export const initMovies = ({
  dom,
  tmdbSearch,
  createContent,
  getParentId,
  onContentCreated,
  setCreateError,
}) => {
  domRef = dom;
  tmdbSearchRef = tmdbSearch;
  createContentRef = createContent;
  getParentIdRef = getParentId;
  onContentCreatedRef = onContentCreated;
  setCreateErrorRef = setCreateError;

  dom.movieQuery.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runMovieSearch(dom.movieQuery.value.trim());
    }
  });

  dom.movieQuery.addEventListener("blur", () => {
    if (dom.movieQuery.value.trim()) {
      runMovieSearch(dom.movieQuery.value.trim());
    }
  });
};