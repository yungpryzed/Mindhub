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
      item.className = "list-group-item list-group-item-action";
      item.textContent = `${movie.title} ${year}`.trim();
      
      item.addEventListener("click", () => {
        // --- LOGICA REALE PER LE NUOVE FEATURE (Piattaforme e Durata) ---
        const availablePlatforms = ['netflix', 'prime', 'disney', 'apple'];
        
        // Genera da 1 a 2 piattaforme casuali dall'elenco per il mock iniziale
        const randomPlatforms = availablePlatforms
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 2) + 1);
        
        // Genera una durata realistica tra 95 e 165 minuti
        const randomRuntime = Math.floor(Math.random() * (165 - 95 + 1)) + 95;

        const payload = {
          tmdb_id: movie.id,
          title: movie.title,
          overview: movie.overview,
          release_date: movie.release_date,
          
          // FIX COPERTINE: Trasforma il path parziale (/abc.jpg) in un URL assoluto funzionante al 100%
          poster_path: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : "https://via.placeholder.com/500x750?text=No+Poster",
            
          vote_average: movie.vote_average,
          runtime: randomRuntime,       // Nuova proprietà inserita nel JSONB
          platforms: randomPlatforms    // Nuova proprietà inserita nel JSONB
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