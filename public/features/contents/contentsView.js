import { buildTreeView } from "../folders/treeView.js";
import { dom } from "../../core/dom.js";

const typeIcons = {
  box: "bi-folder-fill",
  note: "bi-file-earmark-text-fill",
  recipe: "bi-egg-fried",
  movie: "bi-film",
  music: "bi-music-note-beamed",
  todo_list: "bi-check2-square",
};

// Ponytail: mappa unificata (DRY) per loghi di Film e Musica
const platformIcons = {
  netflix: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#E50914"><path d="M6.363 24L6.61 0h3.98l7.08 17.514V0h3.966v24h-3.951L10.334 5.992V24H6.363z"/></svg>',
  prime: '<i class="bi bi-amazon" style="color: #00A8E1;"></i>',
  disney: '<img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" style="height:14px; width:auto; vertical-align:middle;">',
  apple: '<i class="bi bi-apple" style="color: #FFFFFF;"></i>',
  spotify: '<i class="bi bi-spotify" style="color: #1DB954;"></i>',
  amazon: '<i class="bi bi-amazon" style="color: #00A8E1;"></i>',
  default: '<i class="bi bi-film"></i>'
};

export let extractZone = null;

export const initExtractZone = () => {
  if (extractZone) return extractZone;

  extractZone = document.createElement("div");
  extractZone.id = "extractZone";
  extractZone.className = "smart-extract-zone";
  extractZone.innerHTML = `
    <i class="bi bi-box-arrow-up"></i>
    <span>Estrai nella cartella superiore</span>
  `;

  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.appendChild(extractZone);
  } else {
    document.body.appendChild(extractZone);
  }

  return extractZone;
};

export const isMovieItem = (item) =>
  Boolean(item?.payload?.poster_path || item?.payload?.tmdb_id);

export const renderSidebarTree = (flatFolders, currentFolderId) => {
  if (!dom.sidebarTree) return;

  const fragment = document.createDocumentFragment();

  const rootDropzone = document.createElement("div");
  rootDropzone.className = `tree-dropzone mb-3${
    currentFolderId === "root" ? " is-current" : ""
  }`;
  rootDropzone.setAttribute("data-folder-id", "root");

  const icon = document.createElement("i");
  icon.className = "bi bi-house-door-fill tree-icon tree-passthrough";
  rootDropzone.appendChild(icon);

  const span = document.createElement("span");
  span.className = "tree-label tree-passthrough";
  span.textContent = "Dashboard";
  rootDropzone.appendChild(span);

  fragment.appendChild(rootDropzone);

  if (flatFolders && flatFolders.length > 0) {
    const treeRoot = buildTreeView(flatFolders, currentFolderId);
    fragment.appendChild(treeRoot);
  }

  dom.sidebarTree.replaceChildren(fragment);
};

const computeColumns = (count) => {
  if (count <= 0) return 1;
  if (count <= 3) return count;
  if (count === 5) return 2;
  return Math.ceil(Math.sqrt(count));
};

const centerOrphans = (count, columns) => {
  if (count <= 0) return;

  const remainder = count % columns;
  if (remainder === 1 && count > 1) {
    const last = dom.contentGrid.lastElementChild;
    if (last) {
      last.style.gridColumn = "1 / -1";
      last.style.justifySelf = "center";
    }
    return;
  }

  if (remainder > 1) {
    const startIndex = count - remainder;
    const startColumn = Math.floor((columns - remainder) / 2) + 1;
    const firstOrphan = dom.contentGrid.children[startIndex];
    if (firstOrphan) {
      firstOrphan.style.gridColumnStart = startColumn;
    }
  }
};

export const renderFolderPreview = (container, items) => {
  container.innerHTML = "";
  items.forEach((child) => {
    const cell = document.createElement("div");
    cell.className = "folder-preview-cell";

    if (child.type === 'movie' || child.type === 'music') {
      const imgSrc = child.payload?.artworkUrl || (child.payload?.poster_path ? (child.payload.poster_path.startsWith("http") ? child.payload.poster_path : `https://image.tmdb.org/t/p/w500${child.payload.poster_path}`) : null);

      if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.style.objectFit = "cover";
        img.style.width = "100%";
        img.style.height = "100%";
        cell.appendChild(img);
      } else {
        const icon = document.createElement("i");
        icon.className = `bi ${typeIcons[child.type] || "bi-dot"} folder-preview-icon`;
        cell.appendChild(icon);
      }
    } else {
      const icon = document.createElement("i");
      icon.className = `bi ${typeIcons[child.type] || "bi-dot"} folder-preview-icon`;
      cell.appendChild(icon);
    }

    container.appendChild(cell);
  });
};

const buildMovieBadgeHTML = (item) => {
  const platforms = item?.payload?.platforms || [];
  const primaryPlatform = item?.payload?.platform || platforms[0] || "netflix";
  const pIcon = platformIcons[primaryPlatform] || platformIcons.default;
  
  const runtime = Number(item?.payload?.runtime || 0);
  let durationStr = "";
  if (runtime > 0) {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    durationStr = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  const vote = Number(item?.payload?.vote_average || 0);
  const voteStr = vote ? vote.toFixed(1) : "0.0";

  let badgeHTML = `<span class="glass-text">${pIcon}</span>`;
  if (durationStr) badgeHTML += `<span class="glass-text">${durationStr}</span>`;
  if (vote) badgeHTML += `<span class="glass-text"><i class="bi bi-star-fill" style="color: #F5C518;"></i> ${voteStr}</span>`;

  return badgeHTML;
};

export const renderContentsGrid = async (
  items,
  {
    currentParentId,
    onTileClick,
    onContextMenu,
    onTileReady,
    fetchFolderPreview,
    targetContainer = dom.contentGrid,
    skipGridFormatting = false
  }
) => {
  const activeExtractZone = initExtractZone();
  targetContainer.innerHTML = "";

  const columns = computeColumns(items.length);
  const allMovies = items.length > 0 && items.every(isMovieItem);
  const baseSize = allMovies ? 160 : 250;
  
  if (!skipGridFormatting) {
    targetContainer.classList.toggle("movie-row", allMovies);
    targetContainer.style.gridTemplateColumns = allMovies ? "" : `repeat(${columns}, ${baseSize}px)`;
  }
  
  activeExtractZone.classList.toggle("in-folder", currentParentId !== "root");

  items.forEach((item) => {
    const tile = document.createElement("div");
    tile.className = "content-tile";
    tile.dataset.type = item.type;
    tile.dataset.id = item.id;
    tile.setAttribute("draggable", "true");
    tile.style.gridColumn = "auto";
    tile.style.gridColumnStart = "auto";
    tile.style.justifySelf = "auto";

    const title = document.createElement("div");
    title.className = "content-title";
    title.textContent = item.title || "(senza titolo)";

    if (item.type === "box" && currentParentId !== "root") {
      tile.classList.add("folder-tile");

      const folderBody = document.createElement("div");
      folderBody.className = "folder-body";

      const folderIcon = document.createElement("i");
      folderIcon.className = `bi ${typeIcons.box} folder-icon`;
      folderBody.appendChild(folderIcon);

      const preview = document.createElement("div");
      preview.className = "folder-preview-grid";
      folderBody.appendChild(preview);

      tile.appendChild(folderBody);
      tile.appendChild(title);

      fetchFolderPreview(item.id)
        .then((previewItems) => renderFolderPreview(preview, previewItems))
        .catch(() => renderFolderPreview(preview, []));
    } else if (isMovieItem(item)) {
      tile.classList.add("movie-tile");

      const posterPath = item?.payload?.poster_path || "";
      if (posterPath) {
        const fullPosterUrl = posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`;
        tile.style.backgroundImage = `url(${fullPosterUrl})`;
        tile.style.backgroundSize = "cover";
        tile.style.backgroundPosition = "center";
      }

      const glassBadge = document.createElement("div");
      glassBadge.className = "movie-glass-badge";
      glassBadge.innerHTML = buildMovieBadgeHTML(item);
      tile.appendChild(glassBadge);

      const titleOverlay = document.createElement("div");
      titleOverlay.className = "movie-title-overlay";
      title.classList.add("movie-title");
      titleOverlay.appendChild(title);
      tile.appendChild(titleOverlay);
    } else if (item.type === 'music') {
      tile.classList.add("music-wrapper");

      const musicCoverBox = document.createElement("div");
      musicCoverBox.className = "music-cover-box";

      const artworkUrl = item.payload?.artworkUrl || "";
      const img = document.createElement("img");
      img.src = artworkUrl;
      musicCoverBox.appendChild(img);

      const linksBar = document.createElement("div");
      linksBar.className = "music-links-bar";

      const createMusicLink = (url, platformKey) => {
          const btn = document.createElement("div");
          btn.className = "music-link-btn";
          btn.innerHTML = platformIcons[platformKey] || platformIcons.default;
          btn.style.cursor = "pointer";
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation(); // Blocca l'intercettazione del click da parte della card padre
              if(url) window.open(url, "_blank", "noopener,noreferrer"); // Reindirizzamento effettivo
          });
          return btn;
      };

      if (item.payload?.appleMusicUrl) linksBar.appendChild(createMusicLink(item.payload.appleMusicUrl, "apple"));
      if (item.payload?.spotifyUrl) linksBar.appendChild(createMusicLink(item.payload.spotifyUrl, "spotify"));
      if (item.payload?.amazonUrl) linksBar.appendChild(createMusicLink(item.payload.amazonUrl, "amazon"));
      
      const musicInfoArea = document.createElement("div");
      musicInfoArea.className = "music-info-area";
      
      const musicTitle = document.createElement("div");
      musicTitle.className = "music-info-title";
      musicTitle.textContent = item.title || "(Senza Titolo)";
      
      const musicArtist = document.createElement("div");
      musicArtist.className = "music-info-artist";
      musicArtist.textContent = item.payload?.artist || "Artista Sconosciuto";
      
      musicInfoArea.appendChild(musicTitle);
      musicInfoArea.appendChild(musicArtist);

      tile.appendChild(musicCoverBox);
      tile.appendChild(linksBar);
      tile.appendChild(musicInfoArea);
    } else if (item.type === 'note') {
      tile.classList.add("note-card");

      const rawDate = item.updated_at || item.created_at || item.updatedAt || item.createdAt ||
                      item.payload?.updated_at || item.payload?.created_at || item.payload?.updatedAt || item.payload?.createdAt;

      let dateString = "oggi";
      if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
              dateString = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();
          }
      }

      // Estrazione e pulizia preview (Retrocompatibilità text/html)
      const rawText = item.payload?.html || item.payload?.text || "";
      // Strip aggressivo di tutti i tag HTML generati da Quill e decodifica entità base
      const cleanText = rawText.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();

      let tagsHTML = '';
      const tags = item.payload?.tags || [];
      if (tags.length > 0) {
          tagsHTML = '<div class="note-tags">';
          tags.forEach(t => {
              const tagLabel = t.startsWith('#') ? t : `#${t}`;
              tagsHTML += `<span class="note-tag">${tagLabel}</span>`;
          });
          tagsHTML += '</div>';
      }

      tile.innerHTML = `
          <div class="note-header">
              <span class="note-date">${dateString}</span>
              <i class="bi bi-three-dots note-options-icon"></i>
          </div>
          <h3 class="note-title">${item.title || "(Senza Titolo)"}</h3>
          <p class="note-preview">${cleanText}</p>
          ${tagsHTML}
      `;
    } else {
      const icon = document.createElement("i");
      icon.className = `bi ${typeIcons[item.type] || "bi-dot"} content-icon fs-3`;
      tile.appendChild(icon);
      tile.appendChild(title);
    }

    tile.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.stopPropagation();
        tile.classList.toggle("is-selected");
        return;
      }
      
      // FIX: Se è una card musicale, annulla il click per evitare il dump del JSON di debug
      if (item.type === 'music') {
        return;
      }
      
      onTileClick(item);
    });

    tile.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      onContextMenu(item, event);
    });

    onTileReady(tile, item);
    targetContainer.appendChild(tile);
  });

  if (!skipGridFormatting) {
    centerOrphans(items.length, columns);
  }
};
