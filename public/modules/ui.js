import { dom } from "../core/dom.js";
import { apiFetch } from "../core/api.js";

const createTypeOrder = ["box", "note", "todo_list", "movie", "music", "recipe"];

export const setCreateError = (message) => {
  dom.createError.textContent = message || "";
};

export const setLoginError = (message) => {
  dom.loginError.textContent = message || "";
};

export const hideCreateForm = () => {
  dom.createForm.classList.add("d-none");
  const contentTitle = document.getElementById("contentTitle");
  const contentTags = document.getElementById("contentTags");
  if (contentTitle) contentTitle.value = "";
  if (contentTags) contentTags.value = "";
  if (dom.movieQuery) dom.movieQuery.value = "";
  if (dom.movieResults) dom.movieResults.replaceChildren();
  if (dom.musicQuery) dom.musicQuery.value = "";
  if (dom.musicResults) dom.musicResults.replaceChildren();
  setCreateError("");
};

export const showLogin = () => {
  dom.loginView.classList.remove("hidden");
  dom.dashboardView.classList.add("hidden");
  dom.recipeView.classList.add("hidden");
  dom.noteView.classList.add("hidden");
  dom.todoView.classList.add("hidden");
};

export const showDashboard = () => {
  dom.loginView.classList.add("hidden");
  dom.dashboardView.classList.remove("hidden");
  dom.recipeView.classList.add("hidden");
  dom.noteView.classList.add("hidden");
  dom.todoView.classList.add("hidden");
};

export const showRecipe = () => {
  dom.loginView.classList.add("hidden");
  dom.dashboardView.classList.add("hidden");
  dom.recipeView.classList.remove("hidden");
  dom.noteView.classList.add("hidden");
  dom.todoView.classList.add("hidden");
};

export const showNote = () => {
  dom.loginView.classList.add("hidden");
  dom.dashboardView.classList.add("hidden");
  dom.recipeView.classList.add("hidden");
  dom.noteView.classList.remove("hidden");
  dom.todoView.classList.add("hidden");
};

export const showTodo = () => {
  dom.loginView.classList.add("hidden");
  dom.dashboardView.classList.add("hidden");
  dom.recipeView.classList.add("hidden");
  dom.noteView.classList.add("hidden");
  dom.todoView.classList.remove("hidden");
};

export const updateBackButton = (currentParentId) => {
  dom.backBtn.classList.toggle("hidden", currentParentId === "root");
};

export const setCreateMode = (type) => {
  const isMovie = type === "movie";
  const isMusic = type === "music";
  const isBox = type === "box";
  dom.movieSearchBlock.classList.toggle("d-none", !isMovie);
  dom.musicSearchBlock.classList.toggle("d-none", !isMusic);
  dom.titleBlock.classList.toggle("d-none", isMovie || isMusic);
  dom.tagsBlock.classList.toggle("d-none", isMovie || isMusic || isBox);
  dom.createBtn.classList.toggle("d-none", isMovie || isMusic);
};

export const setActiveCreateType = (type) => {
  dom.createTypeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
  setCreateMode(type);
};

export const applyCreateTypeRules = ({
  currentParentConstraint,
  currentCreateType,
  onTypeChange,
}) => {
  const allowedTypes = currentParentConstraint
    ? Array.from(new Set(["box", currentParentConstraint]))
    : createTypeOrder.slice();

  dom.createTypeButtons.forEach((btn) => {
    const isAllowed = allowedTypes.includes(btn.dataset.type);
    btn.classList.toggle("is-hidden", !isAllowed);
  });

  const nextType = allowedTypes.includes(currentCreateType)
    ? currentCreateType
    : allowedTypes[0] || "note";

  if (nextType && nextType !== currentCreateType) {
    onTypeChange(nextType);
  } else {
    setCreateMode(nextType);
  }
};

export const showContextMenu = (x, y, item = null, { onEdit, onDelete } = {}) => {
  dom.contextMenu.style.top = `${y}px`;
  dom.contextMenu.style.left = `${x}px`;

  const oldRenameBtn = document.getElementById("contextRename");
  if (oldRenameBtn) oldRenameBtn.remove();

  dom.contextEdit.style.display = "flex";
  dom.contextDelete.style.display = "flex";

  dom.contextDelete.onclick = () => {
    hideContextMenu();
    if (item && onDelete) onDelete(item.id);
  };

  dom.contextEdit.onclick = () => {
    hideContextMenu();
    if (item && onEdit) onEdit(item);
  };

  const isBox = item?.type === "box";
  const isMovie = item?.type === "movie";
  const icon = document.createElement("i");
  let text;

  if (isBox) {
    icon.className = "bi bi-pencil-square";
    text = " Rinomina";
  } else if (isMovie) {
    icon.className = "bi bi-star-half";
    text = " Recensione";
  } else {
    icon.className = "bi bi-pencil";
    text = " Modifica";
  }

  dom.contextEdit.replaceChildren(icon, document.createTextNode(text));

  dom.contextMenu.classList.remove("hidden");
};

export const hideContextMenu = () => {
  dom.contextMenu.classList.add("hidden");
};

export const showRenameModal = (initialName, onSave) => {
  const overlay = document.createElement("div");
  overlay.className = "custom-modal-overlay";

  const panel = document.createElement("div");
  panel.className = "custom-modal-panel";

  const heading = document.createElement("h4");
  heading.className = "mb-3 fs-6 fw-bold";
  heading.textContent = "Rinomina Cartella";
  panel.appendChild(heading);

  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control mb-4";
  input.id = "renameModalInput";
  input.value = initialName || "";
  input.placeholder = "Nuovo nome...";
  panel.appendChild(input);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "d-flex gap-2 justify-content-end";

  const btnCancel = document.createElement("button");
  btnCancel.className = "btn btn-outline-dark";
  btnCancel.id = "renameModalCancel";
  btnCancel.textContent = "Annulla";
  buttonContainer.appendChild(btnCancel);

  const btnSave = document.createElement("button");
  btnSave.className = "btn btn-dark";
  btnSave.id = "renameModalSave";
  btnSave.textContent = "Salva";
  buttonContainer.appendChild(btnSave);

  panel.appendChild(buttonContainer);
  const fragment = document.createDocumentFragment();
  fragment.appendChild(overlay);

  const close = () => {
    if (overlay.parentNode) document.body.removeChild(overlay);
  };

  btnCancel.onclick = close;
  btnSave.onclick = () => {
    const value = input.value.trim();
    if (value && value !== initialName) onSave(value);
    close();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") btnSave.click();
    if (event.key === "Escape") close();
  });
  
  requestAnimationFrame(() => {
    document.body.appendChild(fragment);
    input.focus();
    input.select();
  });
};

export const showMovieReviewModal = (movieData, onSave) => {
  hideCreateForm();
  const overlay = document.createElement("div");
  overlay.className = "custom-modal-overlay movie-review-overlay";

  const panel = document.createElement("div");
  panel.className = "custom-modal-panel movie-review-panel";
  panel.style.transform = "translateZ(0)";
  panel.style.willChange = "transform";

  const heading = document.createElement("h4");
  heading.className = "mb-4 fs-5 fw-bold text-white text-center";
  heading.textContent = movieData.title || "Recensione Film";
  
  panel.appendChild(heading);

  let currentRating = movieData.payload?.review_rating || movieData.payload?.reviewRating || 0;
  if (currentRating > 0 && currentRating <= 5 && !movieData.payload?.convertedRating) {
      currentRating = currentRating * 20; // adatta il pre-caricamento
  }

  const contentSplit = document.createElement("div");
  contentSplit.className = "review-content-split mb-4";

  const textarea = document.createElement("textarea");
  textarea.className = "form-control movie-review-textarea";
  textarea.placeholder = "I tuoi pensieri su questo film...";
  textarea.value = movieData.payload?.review_notes || movieData.payload?.reviewNotes || "";
  textarea.style.willChange = "contents";
  textarea.style.contain = "layout paint";

  const ratingContainer = document.createElement("div");
  ratingContainer.className = "review-rating-circle";
  ratingContainer.draggable = false;
  
  const ratingValueDisplay = document.createElement("div");
  ratingValueDisplay.className = "rating-value-display";
  ratingValueDisplay.draggable = false;

  ratingContainer.appendChild(ratingValueDisplay);

  const updateCircleVisual = (val) => {
    ratingContainer.style.setProperty('--rating-percent', val);
    if (ratingValueDisplay.parentNode === ratingContainer) {
      ratingValueDisplay.textContent = val;
    }
  };

  updateCircleVisual(currentRating);

  let isDragging = false;
  let startY = 0;
  let startX = 0;
  let startRating = 0;
  let hasMoved = false;

  ratingContainer.addEventListener("mousedown", (e) => {
    if (e.target.tagName === 'INPUT') return;
    e.preventDefault();
    isDragging = true;
    hasMoved = false;
    startY = e.clientY;
    startX = e.clientX;
    startRating = currentRating;
  });

  const onMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY; 
    const deltaX = e.clientX - startX;
    
    if (Math.abs(deltaY) > 2 || Math.abs(deltaX) > 2) hasMoved = true;
    
    const delta = (deltaY + deltaX) * 0.5;
    let newRating = Math.round(startRating + delta);
    if (newRating < 0) newRating = 0;
    if (newRating > 100) newRating = 100;
    
    currentRating = newRating;
    updateCircleVisual(currentRating);
  };

  const onMouseUp = (e) => {
    if (isDragging) {
      isDragging = false;
    }
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  ratingContainer.addEventListener("click", (e) => {
    if (hasMoved) return;
    if (e.target.tagName === 'INPUT') return;

    const input = document.createElement("input");
    input.type = "number";
    input.className = "rating-value-input";
    input.min = "0";
    input.max = "100";
    input.value = currentRating;

    const finalizeInput = () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val)) val = 0;
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      currentRating = val;
      
      if (input.parentNode === ratingContainer) {
        ratingContainer.replaceChild(ratingValueDisplay, input);
      }
      updateCircleVisual(currentRating);
    };

    input.addEventListener("blur", finalizeInput);
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") input.blur();
    });

    ratingContainer.replaceChild(input, ratingValueDisplay);
    input.focus();
    input.select();
  });

  contentSplit.appendChild(textarea);
  contentSplit.appendChild(ratingContainer);
  panel.appendChild(contentSplit);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "d-flex gap-2 justify-content-end";

  const btnCancel = document.createElement("button");
  btnCancel.className = "btn btn-outline-dark movie-btn-custom";
  btnCancel.textContent = "Annulla";

  const btnSave = document.createElement("button");
  btnSave.className = "btn btn-dark movie-btn-custom btn-save-dark";
  btnSave.textContent = "Salva";

  buttonContainer.appendChild(btnCancel);
  buttonContainer.appendChild(btnSave);
  panel.appendChild(buttonContainer);
  
  const fragment = document.createDocumentFragment();
  overlay.appendChild(panel);
  fragment.appendChild(overlay);

  const close = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (overlay.parentNode) document.body.removeChild(overlay);
  };
  btnCancel.onclick = close;
  
 btnSave.onclick = async (e) => {
    e.preventDefault();
    const notesValue = textarea.value.trim();
    
    // Mostra feedback visivo sul bottone
    const originalText = btnSave.textContent;
    btnSave.textContent = "Salvataggio...";
    btnSave.disabled = true;

    try {
      // Usiamo apiFetch: lui sa già dove prendere il token e come gestire il 401!
      const data = await apiFetch("/contents/review", {
        method: "PUT",
        body: JSON.stringify({
          contentId: movieData.id,
          rating: currentRating,
          notes: notesValue
        })
      });

      // Se apiFetch va a buon fine, aggiorna la memoria locale
      if (!movieData.payload) movieData.payload = {};
      movieData.payload.review_rating = currentRating;
      movieData.payload.convertedRating = true;
      movieData.payload.review_notes = notesValue;
      
      if (onSave) onSave(notesValue, currentRating);
      close();

    } catch (err) {
      console.error("Errore durante il salvataggio con apiFetch:", err);
      // Ripristina il bottone solo se non siamo stati reindirizzati al login
      btnSave.textContent = originalText;
      btnSave.disabled = false;
    }
};

  overlay.tabIndex = -1;
  overlay.addEventListener("keydown", (e) => { if(e.key === "Escape") close(); });
  
  requestAnimationFrame(() => {
    document.body.appendChild(fragment);
    overlay.focus();
  });
};
