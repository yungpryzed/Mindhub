let domRef = null;
let searchMusicRef = null;
let createContentRef = null;
let getParentIdRef = null;
let onContentCreatedRef = null;
let setCreateErrorRef = null;

const resetMusicSearchUI = () => {
  if (!domRef) return;
  domRef.musicResults.innerHTML = "";
  domRef.musicQuery.value = "";
};

const createMusicContent = async (item) => {
  if (!createContentRef || !getParentIdRef || !setCreateErrorRef || !onContentCreatedRef) return;

  const { title, artist, artworkUrl } = item;

  try {
    const parent_id = getParentIdRef() === "root" ? null : getParentIdRef();
    const payload = {
      title,
      artist,
      artworkUrl,
      appleMusicUrl: item.appleMusicUrl || item.collectionViewUrl,
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist + ' ' + title)}`,
      amazonUrl: `https://music.amazon.com/search/${encodeURIComponent(artist + ' ' + title)}`,
    };

    await createContentRef({
      type: "music",
      title: title || "(senza titolo)",
      payload,
      parent_id,
    });

    resetMusicSearchUI();
    domRef.createForm.classList.add("d-none");
    onContentCreatedRef();
  } catch (error) {
    setCreateErrorRef(error.message || "Errore di rete");
  }
};

const runMusicSearch = async (query) => {
  if (!domRef || !searchMusicRef || !setCreateErrorRef) return;

  domRef.musicResults.innerHTML = "";

  if (!query) {
    setCreateErrorRef("Inserisci un album o un brano da cercare.");
    return;
  }

  try {
    const results = await searchMusicRef(query);
    setCreateErrorRef("");

    results.slice(0, 8).forEach((item) => {
      const resultEl = document.createElement("button");
      resultEl.type = "button";
      resultEl.className = "list-group-item list-group-item-action";
      
      const artworkUrl = item.artworkUrl.replace('600x600bb', '100x100bb');
      const title = item.title;
      const artist = item.artist;

      resultEl.innerHTML = `
        <img src="${artworkUrl}" class="music-search-thumb" alt="cover">
        <div class="music-search-text">
            <span class="music-search-title">${title}</span>
            <span class="music-search-artist">&bull; ${artist}</span>
        </div>
      `;
      
      resultEl.addEventListener("click", () => createMusicContent(item));
      domRef.musicResults.appendChild(resultEl);
    });
  } catch (error) {
    setCreateErrorRef("Errore di rete durante la ricerca su iTunes.");
  }
};

export const initMusic = ({ 
  dom, 
  searchMusic, 
  createContent, 
  getParentId, 
  onContentCreated, 
  setCreateError 
}) => {
  domRef = dom;
  searchMusicRef = searchMusic;
  createContentRef = createContent;
  getParentIdRef = getParentId;
  onContentCreatedRef = onContentCreated;
  setCreateErrorRef = setCreateError;

  if (dom.musicQuery) {
    dom.musicQuery.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runMusicSearch(dom.musicQuery.value.trim());
      }
    });

    dom.musicQuery.addEventListener("blur", () => {
      if (dom.musicQuery.value.trim()) {
        runMusicSearch(dom.musicQuery.value.trim());
      }
    });
  }
};
