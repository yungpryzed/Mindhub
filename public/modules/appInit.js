import * as api from "../core/api.js";
import * as dragdrop from "../features/dragdrop/dragdrop.js";
import * as notes from "../features/notes/notes.js";
import * as todos from "../features/todos/todos.js";
import * as movies from "../features/movies/movies.js";
import * as recipes from "../features/recipes/recipes.js";
import * as music from "../features/music/music.js";
import * as ui from "./ui.js";
import { dom } from "../core/dom.js";
import * as contentsView from "../features/contents/contentsView.js";
import { authManager } from "../features/auth/authManager.js";
import { initLassoSelection } from "../features/dragdrop/lasso.js";
import { state, setState, pushHistory, popHistory } from "../core/state.js";
import { deriveConstraintFromBox } from "../core/utils.js";
import { initCreateContentController } from "../features/dashboard/createContentController.js";
import { initSearch } from "../features/search/search.js";


const handleItemClick = (item, loadContentsFn) => {
  ui.hideCreateForm();

  if (item.type === "box") {
    pushHistory({ parentId: state.currentParentId, constraint: state.currentParentConstraint });
    setState({
      currentParentId: item.id,
      currentParentConstraint: deriveConstraintFromBox(item),
    });
    loadContentsFn();
    return;
  }

  if (item.type === "note") {
    notes.openNote(item);
    return;
  }

  if (item.type === "todo_list") {
    todos.openTodo(item);
    return;
  }

  if (item.type === "movie") {
    alert(JSON.stringify(item.payload, null, 2));
    return;
  }

  if (item.type === "music") {
    alert(JSON.stringify(item.payload, null, 2));
    return;
  }

  if (item.type === "recipe") {
    recipes.renderRecipe(item);
  }
};

const goBack = (loadContentsFn) => {
  ui.hideCreateForm();

  if (!dom.recipeView.classList.contains("hidden")) {
    ui.showDashboard();
    loadContentsFn();
    return true;
  }

  if (!dom.noteView.classList.contains("hidden") || !dom.todoView.classList.contains("hidden")) {
    notes.clearNoteState();
    todos.clearTodoState();
    ui.showDashboard();
    loadContentsFn();
    return true;
  }

  const previous = popHistory();
  if (previous || state.currentParentId !== "root") {
    setState({
      currentParentId: previous?.parentId || "root",
      currentParentConstraint: previous?.constraint || null,
    });
    loadContentsFn();
    return true;
  }

  return false;
};

export const initApp = () => {
  // Holder object per permettere l'auto-riferimento funzionale
  const loadFn = { current: () => {} };

  try {


    // Inizializza i moduli PRIMA di tutti gli handler (necessari per openNote/openTodo)
    notes.initNotes({ dom, updateContent: api.updateContent, showNote: ui.showNote });
    todos.initTodos({ dom, updateContent: api.updateContent, showTodo: ui.showTodo });
    recipes.initRecipes({ dom, showRecipe: ui.showRecipe });

    loadFn.current = async () => {
      ui.hideCreateForm();
      ui.updateBackButton(state.currentParentId);
      ui.applyCreateTypeRules({
        currentParentConstraint: state.currentParentConstraint,
        currentCreateType: state.currentCreateType,
        onTypeChange: (nextType) => {
          setState({ currentCreateType: nextType });
          ui.setActiveCreateType(nextType);
        },
      });

      try {
        const [allFolders, data, allUserContents] = await Promise.all([
          api.fetchAllFolders(),
          api.fetchContents(state.currentParentId),
          api.fetchAllContents(),
        ]);

        setState({ allUserContents: allUserContents || [] });
        contentsView.renderSidebarTree(allFolders, state.currentParentId);

        if (!Array.isArray(data)) {
          dom.contentGrid.innerHTML = "";
          return;
        }
        setState({ lastContents: data });

        const baseRenderOpts = {
          currentParentId: state.currentParentId,
          fetchFolderPreview: api.fetchFolderPreview,
          onTileClick: (item) => handleItemClick(item, loadFn.current),
          onContextMenu: (item, event) => {
            setState({ contextTarget: { id: item.id, type: item.type } });

            ui.showContextMenu(event.clientX, event.clientY, item, {
              onEdit: (entry) => {
                if (entry.type === 'movie') {
                  ui.showMovieReviewModal(entry, async (notes, rating) => {
                    try {
                      const currentPayload = entry.payload || {};
                      const updatedPayload = {
                        ...currentPayload,
                        reviewNotes: notes,
                        reviewRating: rating,
                      };
                      delete updatedPayload.review; // Clean up old data structure

                      await api.updateContent(entry.id, { payload: updatedPayload });
                      loadFn.current();
                    } catch (err) {
                      ui.setCreateError(err.message || "Errore durante il salvataggio della recensione.");
                    }
                  });
                } else if (entry.type === "box") {
                  ui.showRenameModal(entry.title, async (newTitle) => {
                    try {
                      await api.updateContent(entry.id, { title: newTitle });
                      loadFn.current();
                    } catch (err) {
                      ui.setCreateError(err.message || "Errore durante la rinomina.");
                    }
                  });
                } else {
                  handleItemClick(entry, loadFn.current);
                }
              },
              onDelete: async (id) => {
                const selectedTiles = Array.from(document.querySelectorAll(".content-tile.is-selected"));
                const selectedIds = selectedTiles.map((tile) => tile.dataset.id).filter(Boolean);
                const idsToDelete = selectedIds.length > 0 ? selectedIds : [id];

                if (item.type === "box" && state.currentParentId === "root") {
                  const confirmDelete = confirm(
                    "Sei sicuro di voler eliminare questo Box principale e tutto il suo contenuto?"
                  );
                  if (!confirmDelete) return;
                }

                try {
                  await Promise.all(idsToDelete.map((contentId) => api.deleteContent(contentId)));

                  selectedTiles.forEach((tile) => tile.remove());
                  dragdrop.resetDragState(dom.contentGrid);
                  loadFn.current();
                } catch (err) {
                  ui.setCreateError(err.message || "Errore durante l'eliminazione.");
                }
              },
            });
          },
          onTileReady: (tile, item) => {
            dragdrop.attachDragHandlers(tile, item, {
              contentGrid: dom.contentGrid,
              reorderContents: api.reorderContents,
              mergeToFolder: api.mergeToFolder,
              updateContent: api.updateContent,
              onMergeSuccess: loadFn.current,
              getLastContents: () => state.lastContents,
              setLastContents: (next) => setState({ lastContents: next }),
              setError: ui.setCreateError,
            });
          },
        };

        await contentsView.renderContentsGrid(data, {
          ...baseRenderOpts,
          targetContainer: dom.contentGrid,
          skipGridFormatting: false
        });

        // --- DASHBOARD POPULATION ---
        if (allUserContents && allUserContents.length > 0) {
          const recentMovies = allUserContents.filter(i => i.type === 'movie').slice(0, 10);
          const loopMusic = allUserContents.filter(i => i.type === 'music').slice(0, 5);
          const latestNotes = allUserContents.filter(i => i.type === 'note').slice(0, 10);

          if (dom.dashMovies) await contentsView.renderContentsGrid(recentMovies, { ...baseRenderOpts, targetContainer: dom.dashMovies, skipGridFormatting: true });
          if (dom.dashMusic) await contentsView.renderContentsGrid(loopMusic, { ...baseRenderOpts, targetContainer: dom.dashMusic, skipGridFormatting: true });
          if (dom.dashNotes) await contentsView.renderContentsGrid(latestNotes, { ...baseRenderOpts, targetContainer: dom.dashNotes, skipGridFormatting: true });
        }
      } catch (error) {
        if (error?.message?.toLowerCase().includes("authorization") ||
            error?.message?.toLowerCase().includes("token") ||
            error?.message?.toLowerCase().includes("unauthorized")) {
          authManager.clearToken();
          ui.showLogin();
          ui.setLoginError("Sessione scaduta. Effettua di nuovo il login.");
          return;
        }
        dom.contentGrid.innerHTML = "";
        dragdrop.resetDragState(dom.contentGrid);
      }
    };

    // Ora possiamo inizializzare createContentController (dipende da notes.openNote/todos.openTodo)
    initCreateContentController(loadFn.current);

    // Inizializza anche movies (dipende da loadFn.current)
    movies.initMovies({
      dom,
      tmdbSearch: api.tmdbSearch,
      createContent: api.createContent,
      getParentId: () => state.currentParentId,
      onContentCreated: loadFn.current,
      setCreateError: ui.setCreateError,
    });

    music.initMusic({
      dom,
      searchMusic: api.searchMusic,
      createContent: api.createContent,
      getParentId: () => state.currentParentId,
      onContentCreated: loadFn.current,
      setCreateError: ui.setCreateError,
    });
    
    initLassoSelection({
      mainContent: document.querySelector(".main-content"),
      contentGrid: dom.contentGrid
    });

    const extractZone = contentsView.initExtractZone();
    if (extractZone) {
      dragdrop.attachExtractZoneHandler(extractZone, {
        contentGrid: dom.contentGrid,
        updateContent: api.updateContent,
        getTargetParentId: () => {
          const previous = popHistory();
          if (previous) {
            const targetId = previous.parentId || "root";
            pushHistory(previous);
            return targetId;
          }
          return "root";
        },
        onExtractSuccess: (extractedEls, extractedIds) => {
          if (extractedEls && extractedIds) {
            extractedEls.forEach(el => {
              el.classList.add("fade-out-removed");
              setTimeout(() => el.remove(), 300);
            });
            const currentContents = state.lastContents || [];
            setState({ lastContents: currentContents.filter(c => !extractedIds.includes(String(c.id))) });
          }
        },
        setError: ui.setCreateError
      });
    }

    if (dom.sidebarDrawer && dom.sidebarTriggerBtn) {
      let hoverTimeout;
      let isSidebarPinned = false;
      let isDraggingGlobal = false;

      document.addEventListener("dragstart", () => { isDraggingGlobal = true; document.body.classList.add("is-dragging-global"); });
      document.addEventListener("dragend", () => {
        isDraggingGlobal = false;
        document.body.classList.remove("is-dragging-global");
        if (!dom.sidebarDrawer.matches(':hover') && !dom.sidebarTriggerBtn.matches(':hover')) {
          closeSidebar();
        }
      });

      const openSidebar = () => {
        clearTimeout(hoverTimeout);
        dom.sidebarDrawer.classList.add("is-open");
        if (dom.sidebarOverlay) dom.sidebarOverlay.classList.add("is-active");
      };

      const closeSidebar = () => {
        if (isSidebarPinned || isDraggingGlobal) return;
        hoverTimeout = setTimeout(() => {
          dom.sidebarDrawer.classList.remove("is-open");
          if (dom.sidebarOverlay) dom.sidebarOverlay.classList.remove("is-active");
        }, 300);
      };

      dom.sidebarTriggerBtn.addEventListener("mouseenter", openSidebar);
      dom.sidebarDrawer.addEventListener("mouseenter", openSidebar);
      dom.sidebarTriggerBtn.addEventListener("mouseleave", closeSidebar);
      dom.sidebarDrawer.addEventListener("mouseleave", closeSidebar);
      dom.sidebarTriggerBtn.addEventListener("dragenter", openSidebar);
      dom.sidebarDrawer.addEventListener("dragenter", openSidebar);
      dom.sidebarTriggerBtn.addEventListener("dragover", (e) => e.preventDefault());

      if (dom.sidebarOverlay) {
        dom.sidebarOverlay.addEventListener("click", () => {
          isSidebarPinned = false;
          dom.sidebarTriggerBtn.classList.remove("active-pin");
          closeSidebar();
        });
      }

      dom.sidebarTriggerBtn.addEventListener("click", () => {
        isSidebarPinned = !isSidebarPinned;
        dom.sidebarTriggerBtn.classList.toggle("active-pin", isSidebarPinned);
        if (isSidebarPinned) openSidebar();
        else closeSidebar();
      });
    }

    if (dom.sidebarTree) {
      dragdrop.attachTreeDropDelegation(dom.sidebarTree.parentElement, {
        contentGrid: dom.contentGrid,
        updateContent: api.updateContent,
        onMoveSuccess: () => loadFn.current(),
        setError: ui.setCreateError
      });

      dom.sidebarTree.parentElement.addEventListener("click", (e) => {
        const dropzone = e.target.closest(".tree-dropzone");
        if (!dropzone) return;
        const folderId = dropzone.dataset.folderId;
        if (folderId && folderId !== state.currentParentId) {
          pushHistory({ parentId: state.currentParentId, constraint: state.currentParentConstraint });
          setState({ currentParentId: folderId, currentParentConstraint: null });
          loadFn.current();
        }
      });

      let expandTimeout;
      const handleExpandEnter = (e) => {
        const dropzone = e.target.closest(".tree-dropzone");
        if (!dropzone) return;
        const details = dropzone.parentElement;
        if (details && details.tagName === "DETAILS" && !details.hasAttribute("open")) {
          if (details.dataset.expanding) return;
          clearTimeout(expandTimeout);
          details.dataset.expanding = "true";
          expandTimeout = setTimeout(() => {
            details.setAttribute("open", "");
            delete details.dataset.expanding;
          }, 800);
        }
      };

      const handleExpandLeave = (e) => {
        const dropzone = e.target.closest(".tree-dropzone");
        if (!dropzone) return;
        const details = dropzone.parentElement;
        if (details && details.tagName === "DETAILS") {
          delete details.dataset.expanding;
          clearTimeout(expandTimeout);
        }
      };

      const container = dom.sidebarTree.parentElement;
      container.addEventListener("mouseover", handleExpandEnter);
      container.addEventListener("mouseout", handleExpandLeave);
      container.addEventListener("dragover", handleExpandEnter);
      container.addEventListener("dragleave", handleExpandLeave);
      container.addEventListener("drop", handleExpandLeave);
    }

    // ASCOLTATORI DEI TASTI BACK DELLA UI
    if (dom.backBtn) dom.backBtn.addEventListener("click", () => goBack(loadFn.current));
    if (dom.recipeBackBtn) dom.recipeBackBtn.addEventListener("click", () => goBack(loadFn.current));
    if (dom.noteBackBtn) dom.noteBackBtn.addEventListener("click", () => goBack(loadFn.current));
    if (dom.todoBackBtn) dom.todoBackBtn.addEventListener("click", () => goBack(loadFn.current));

   // ASCOLTATORE DEL TASTO LATERALE DEL MOUSE (MB4 / Back Button del Mouse)
    document.addEventListener("mouseup", (event) => {
      if (event.button === 3) {
        const handledInternally = goBack(loadFn.current);
        if (handledInternally) {
          event.preventDefault();
        }
      }
    }, { passive: false });

    document.addEventListener("click", () => {
      ui.hideContextMenu();
    });

    // INIZIALIZZAZIONE SEARCH MODAL
    if (dom && dom.searchInput && dom.searchModal) {
      initSearch({ 
        dom, 
        onResultClick: (item) => handleItemClick(item, loadFn.current),
        getCurrentContents: () => state.allUserContents || []
      });
    }
  } catch (error) {
    console.error("Feature initialization failed, continuing boot:", error);
  }

  // Pezzo di codice 
  authManager.attachLoginForm("loginForm", "loginEmail", "loginPassword", "loginError", () => {
    ui.showDashboard();
    loadFn.current();
  });

  // CONTROLLO DEI 7 GIORNI (AUTO-LOGIN AL BOOT)
  if (authManager.hasToken()) {
    ui.showDashboard();
    loadFn.current();
  } else {
    ui.showLogin();
  }
};