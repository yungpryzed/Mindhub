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

const platformLogos = {
  netflix: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#E50914"><path d="M6.363 24L6.61 0h3.98l7.08 17.514V0h3.966v24h-3.951L10.334 5.992V24H6.363z"/></svg>`,
  prime: `<svg viewBox="0 0 100 30" width="36" height="12"><path fill="#FFFFFF" d="M15.8,17.4h-3v5.8h-3.4V7.5h6.6c3.4,0,5.6,1.8,5.6,5C21.4,15.5,19.2,17.4,15.8,17.4z M15.6,10.2h-2.8v4.5h2.8c1.5,0,2.3-0.8,2.3-2.3C17.9,11,17.1,10.2,15.6,10.2z M24.3,23.2V11.6h3.2v1.6c0.8-1.2,2.1-1.9,3.7-1.9c0.4,0,0.8,0.1,1.1,0.2v3.2c-0.3-0.1-0.7-0.1-1.1-0.1c-2.1,0-3.6,1.3-3.6,3.6v5.1H24.3z M35.6,11.6h3.4v11.6h-3.4V11.6z M37.3,6.8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S36.2,6.8,37.3,6.8z M44.6,23.2V11.6h3.2v1.3c1-1,2.5-1.6,4.1-1.6c1.8,0,3.1,0.8,3.8,2.1c1.1-1.4,2.8-2.1,4.7-2.1c2.8,0,4.6,1.8,4.6,5v6.9h-3.4v-6c0-1.7-0.9-2.5-2.2-2.5c-1.4,0-2.5,1.1-2.5,2.9v5.6h-3.4v-6c0-1.7-0.9-2.5-2.2-2.5c-1.4,0-2.5,1.1-2.5,2.9v5.6H44.6z M70.3,17.9c0.1,2.1,1.6,3.3,3.8,3.3c1.7,0,3-0.5,4-1.2v2.4c-1.1,0.8-2.9,1.2-4.6,1.2c-4.2,0-6.6-2.5-6.6-6.1c0-3.6,2.2-6.1,6.1-6.1c3.9,0,5.6,2.6,5.6,5.8c0,0.3,0,0.5,0,0.7H70.3z M75.4,15.6c-0.1-1.5-1.1-2.4-2.5-2.4c-1.4,0-2.4,1-2.5,2.4H75.4z M83.2,21.5c-3.2,2.8-8.1,4.1-12.8,2.6c-1.6-0.5-3.3-1.4-4.7-2.6c-0.2-0.2-0.2-0.6,0.1-0.7c0.2-0.1,0.4-0.1,0.5,0c4.1,2.7,8.8,3.5,13.4,2.2c4.1-1.1,7.2-3.3,9.4-6c0.1-0.2,0.4-0.2,0.6-0.1C89.9,17.2,89.5,19.3,83.2,21.5z"/><path fill="#00A8E1" d="M83.2,21.5c-3.2,2.8-8.1,4.1-12.8,2.6c-1.6-0.5-3.3-1.4-4.7-2.6c-0.2-0.2-0.2-0.6,0.1-0.7c0.2-0.1,0.4-0.1,0.5,0c4.1,2.7,8.8,3.5,13.4,2.2c4.1-1.1,7.2-3.3,9.4-6c0.1-0.2,0.4-0.2,0.6-0.1C89.9,17.2,89.5,19.3,83.2,21.5z"/></svg>`,
  apple: `<svg viewBox="0 0 384 512" width="13" height="13" fill="#FFFFFF"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`,
  disney: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#FFFFFF"><path d="M12.92 7.78c-1.12-1.2-2.52-1.76-4.2-1.76-2.22 0-4.04.9-4.04 2.86 0 .42.1.8.3 1.13.23-.22.5-.42.8-.57-.45-.44-.57-.96-.4-1.36.4-1 2.3-.92 3.87.1 1.5.96 1.87 1.94 1.5 2.6-.08.14-.2.27-.36.38.3.06.6.14.88.24.4-.3.73-.67.95-1.1.58-1.12-.14-2.5-1.3-3.5z"/><path d="M20.25 10h-2.15V7.85h-1.35V10h-2.16v1.36h2.16v2.15h1.35v-2.15h2.15z"/></svg>`,
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
  const primaryPlatform = platforms[0] || "netflix";
  const logoHTML = platformLogos[primaryPlatform] || platformLogos.netflix;
  const runtime = Number(item?.payload?.runtime || 0);
  const vote = Number(item?.payload?.vote_average || 0);
  const voteStr = vote ? vote.toFixed(1) : "0.0";

  let durationStr = "";
  if (runtime > 0) {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    durationStr = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  let badgeHTML = `<div class="glass-logo">${logoHTML}</div>`;
  if (durationStr) badgeHTML += `<span class="glass-text">${durationStr}</span>`;
  badgeHTML += `<span class="glass-text"><i class="bi bi-star-fill text-warning"></i> ${voteStr}</span>`;

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

      const createMusicLink = (url, iconClass) => {
          const btn = document.createElement("div");
          btn.className = "music-link-btn";
          btn.innerHTML = `<i class="bi ${iconClass}"></i>`;
          btn.style.cursor = "pointer";
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation(); // Blocca l'intercettazione del click da parte della card padre
              if(url) window.open(url, "_blank", "noopener,noreferrer"); // Reindirizzamento effettivo
          });
          return btn;
      };

      if (item.payload?.appleMusicUrl) linksBar.appendChild(createMusicLink(item.payload.appleMusicUrl, "bi-apple"));
      if (item.payload?.spotifyUrl) linksBar.appendChild(createMusicLink(item.payload.spotifyUrl, "bi-spotify"));
      if (item.payload?.amazonUrl) linksBar.appendChild(createMusicLink(item.payload.amazonUrl, "bi-amazon"));
      
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
