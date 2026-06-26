import { moveMultipleToFolder } from "../../core/api.js";

let dragSourceIds = [];
let dragSourceTypes = [];
let draggedEls = [];

const getSelectedTiles = (contentGrid) => {
  if (!contentGrid) return [];
  return Array.from(contentGrid.querySelectorAll(".content-tile.is-selected"));
};

const getActiveDragTiles = (contentGrid) => {
  const selectedTiles = getSelectedTiles(contentGrid);
  if (selectedTiles.length > 0) return selectedTiles;
  if (draggedEls.length > 0) return [...draggedEls];
  return [];
};

const resolveDashboardTile = (event) => event.target?.closest(".content-tile") || event.currentTarget;

export const resetDragState = (contentGrid) => {
  dragSourceIds = [];
  dragSourceTypes = [];
  draggedEls = [];
  if (contentGrid) contentGrid.classList.remove("is-dragging");
  if (contentGrid) {
    contentGrid.querySelectorAll(".content-tile").forEach((el) => {
      el.classList.remove("dragging", "merge-center", "insert-left", "insert-right");
    });
  }
};

export const persistOrderFromGrid = async ({
  contentGrid,
  reorderContents,
  getLastContents,
  setLastContents,
  setError,
}) => {
  const orderedIds = Array.from(contentGrid.children)
    .map((el) => el.dataset.id)
    .filter((id) => id);

  const items = orderedIds.map((id, position) => ({ id, position }));
  if (!items.length) return;

  try {
    await reorderContents(items);
    const orderMap = new Map(items.map((item) => [item.id, item.position]));
    const current = getLastContents();
    setLastContents(
      [...current].sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      )
    );
  } catch (error) {
    setError(error.message || "Errore riordinamento.");
  }
};

export const attachTreeDropDelegation = (sidebarContainer, { contentGrid, onMoveSuccess, setError }) => {
  if (!sidebarContainer) return;

  sidebarContainer.addEventListener("dragover", (event) => {
    const dropzone = event.target.closest(".tree-dropzone");
    if (!dropzone || draggedEls.length === 0) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    dropzone.classList.add("drag-over");
  });

  sidebarContainer.addEventListener("dragleave", (event) => {
    const dropzone = event.target.closest(".tree-dropzone");
    if (dropzone) dropzone.classList.remove("drag-over");
  });

  sidebarContainer.addEventListener("drop", async (event) => {
    const dropzone = event.target.closest(".tree-dropzone");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.remove("drag-over");

    if (dragSourceIds.length === 0) return;

    const targetFolderId = dropzone.dataset.folderId;
    if (dragSourceIds.includes(targetFolderId)) return;

    try {
      const finalParent = targetFolderId === "root" ? null : targetFolderId;
      await moveMultipleToFolder([...dragSourceIds], finalParent);
      resetDragState(contentGrid);
      if (onMoveSuccess) onMoveSuccess();
    } catch (error) {
      if (setError) setError(error.message || "Errore spostamento nella cartella.");
    }
  });
};

export const attachExtractZoneHandler = (extractZone, { contentGrid, getTargetParentId, onExtractSuccess, setError }) => {
  if (!extractZone) return;

  extractZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (draggedEls.length === 0) return;
    event.dataTransfer.dropEffect = "move";
    extractZone.classList.add("drag-over");
  });

  extractZone.addEventListener("dragleave", () => {
    extractZone.classList.remove("drag-over");
  });

  extractZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    extractZone.classList.remove("drag-over");

    if (dragSourceIds.length === 0) return;

    const extractedEls = [...draggedEls];
    const extractedIds = [...dragSourceIds];

    try {
      const destinationParentId = getTargetParentId();
      const finalParent = destinationParentId === "root" ? null : destinationParentId;

      await moveMultipleToFolder(extractedIds, finalParent);

      resetDragState(contentGrid);
      if (onExtractSuccess) onExtractSuccess(extractedEls, extractedIds);
    } catch (error) {
      if (setError) setError(error.message || "Impossibile completare l'estrazione.");
    }
  });
};

export const attachDragHandlers = (
  tile,
  item,
  {
    contentGrid,
    reorderContents,
    mergeToFolder,
    moveMultipleToFolder: moveMultipleToFolderFromProps,
    onMergeSuccess,
    getLastContents,
    setLastContents,
    setError,
  }
) => {
  tile.addEventListener("dragstart", (event) => {
    const selectedTiles = getSelectedTiles(contentGrid);

    if (tile.classList.contains("is-selected") || selectedTiles.length > 0) {
      draggedEls = selectedTiles.length > 0 ? selectedTiles : [tile];
    } else {
      draggedEls = [tile];
      getSelectedTiles(contentGrid).forEach((el) => el.classList.remove("is-selected"));
    }
    
    dragSourceIds = draggedEls.map(el => el.dataset.id);
    dragSourceTypes = draggedEls.map(el => el.dataset.type);
    
    setTimeout(() => {
      draggedEls.forEach(el => el.classList.add("dragging"));
      if (contentGrid) contentGrid.classList.add("is-dragging"); 
    }, 0);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/json", JSON.stringify(dragSourceIds));
  });

  tile.addEventListener("dragend", () => {
    resetDragState(contentGrid);
  });

  tile.addEventListener("dragover", (event) => {
    event.preventDefault();
    const dashboardTile = resolveDashboardTile(event);
    if (draggedEls.length === 0 || draggedEls.includes(dashboardTile)) return; 

    event.dataTransfer.dropEffect = "move";
    const rect = dashboardTile.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const width = rect.width;

    dashboardTile.classList.remove("merge-center", "insert-left", "insert-right", "drag-over-folder");

    // HITBOX UNIVERSALE: ogni elemento accetta merge al centro E riordino ai lati
    const mergeStart = width * 0.40;
    const mergeEnd = width * 0.60;

    if (mouseX > mergeStart && mouseX < mergeEnd) {
      dashboardTile.classList.add("merge-center");
    } else if (mouseX <= width / 2) {
      dashboardTile.classList.add("insert-left");
    } else {
      dashboardTile.classList.add("insert-right");
    }
  });

  tile.addEventListener("dragleave", () => {
    tile.classList.remove("merge-center", "insert-left", "insert-right", "drag-over-folder");
  });

  tile.addEventListener("drop", async (event) => {
    event.preventDefault();

    const isDashboardVisible = !document.getElementById("view-dashboard")?.classList.contains("hidden");
    if (isDashboardVisible && !event.target.closest(".dashboard-section")) return;

    const dashboardTile = resolveDashboardTile(event);
    const targetItem = item;
    const activeTiles = getActiveDragTiles(contentGrid);
    const sourceIds = activeTiles.map((el) => el.dataset.id).filter(Boolean);
    const sourceTypes = activeTiles.map((el) => el.dataset.type).filter(Boolean);
    const targetId = String(targetItem.id);

    if (sourceIds.length === 0 || sourceIds.includes(targetId)) {
      resetDragState(contentGrid);
      return;
    }

    const isMergeCenter = dashboardTile.classList.contains("merge-center");
    const isInsertLeft = dashboardTile.classList.contains("insert-left");
    const isInsertRight = dashboardTile.classList.contains("insert-right");

    const elsToMove = [...activeTiles];

    dashboardTile.classList.remove("merge-center", "insert-left", "insert-right", "drag-over-folder");

    try {
      // SCENARIO 1: Merge (drop al centro su qualsiasi elemento)
      if (isMergeCenter) {
        const firstId = sourceIds[0];
        const sourceType = sourceTypes[0];

        // Se il target è una cartella, sposta gli elementi dentro
        if (targetItem.type === "box") {
          await (moveMultipleToFolderFromProps || moveMultipleToFolder)(sourceIds, targetItem.id);
        } else {
          // Se il target non è una cartella, crea una nuova cartella e sposta gli elementi dentro
          const res = await mergeToFolder(firstId, targetItem.id, sourceType);
          if (sourceIds.length > 1) {
            const newFolderId = res.folder_id;
            const restIds = sourceIds.slice(1);
            await (moveMultipleToFolderFromProps || moveMultipleToFolder)(restIds, newFolderId);
          }
        }
        resetDragState(contentGrid);
        onMergeSuccess();
      }

      // SCENARIO 2: Riordino (drop ai lati)
      if (isInsertLeft || isInsertRight) {
        if (elsToMove.length > 0 && !elsToMove.includes(tile)) {
          let referenceNode = isInsertLeft ? tile : tile.nextSibling;
          elsToMove.forEach(el => {
            contentGrid.insertBefore(el, referenceNode);
          });
          await persistOrderFromGrid({
            contentGrid,
            reorderContents,
            getLastContents,
            setLastContents,
            setError,
          });
        }
      }
    } catch (error) {
      setError(error.message || "Errore drag & drop");
    } finally {
      resetDragState(contentGrid);
    }
  });
};
