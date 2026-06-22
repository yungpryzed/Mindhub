import * as api from "../../core/api.js";
import * as ui from "../../modules/ui.js";
import { dom } from "../../core/dom.js";
import { state, setState } from "../../core/state.js";
import * as notes from "../notes/notes.js";
import * as todos from "../todos/todos.js";

export const initCreateContentController = (loadContents) => {
  if (!dom.toggleCreate || !dom.createForm) return;

  dom.toggleCreate.addEventListener("click", () => {
    const reviewModal = document.querySelector(".movie-review-overlay");
    if (reviewModal && reviewModal.parentNode) {
      reviewModal.parentNode.removeChild(reviewModal);
    }
    dom.createForm.classList.toggle("d-none");
  });

  // Chiusura automatica del form al click esterno (click-outside)
  document.addEventListener("click", (e) => {
    const createForm = dom.createForm;
    const toggleBtn = dom.toggleCreate;

    if (!createForm || !toggleBtn) return;
    if (createForm.classList.contains("d-none")) return; // Se già chiuso, ignora

    // Se il click è dentro il form o sul bottone toggle, non fare nulla
    if (createForm.contains(e.target) || toggleBtn.contains(e.target)) return;

    // Altrimenti chiudi il form
    createForm.classList.add("d-none");
  });

  if (dom.createTypeButtons) {
    dom.createTypeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextType = btn.dataset.type;
        setState({ currentCreateType: nextType });
        ui.setActiveCreateType(nextType);
      });
    });
  }

  if (dom.createBtn) {
    dom.createBtn.addEventListener("click", async () => {
      const type = state.currentCreateType;
      const titleEl = document.getElementById("contentTitle");
      const tagsEl = document.getElementById("contentTags");
      const title = titleEl ? titleEl.value : "";
      const tagsInput = tagsEl ? tagsEl.value : "";

      ui.setCreateError("");

      if (type === "movie") {
        ui.setCreateError("Seleziona un film dai risultati.");
        return;
      }

      let payload;
      if (type === "note") {
        payload = { html: "" };
      } else if (type === "todo_list") {
        payload = { items: [] };
      } else if (type === "recipe") {
        payload = { ingredients: [], steps: [] };
      } else {
        payload = {};
      }

      const tags = tagsInput
        ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const parent_id = state.currentParentId === "root" ? null : state.currentParentId;

      try {
        const data = await api.createContent({ type, title, tags, payload, parent_id });

        ui.hideCreateForm(); // Pulizia completa e chiusura post-creazione

        if (data.type === "note") {
          notes.openNote(data);
          return;
        }

        if (data.type === "todo_list") {
          todos.openTodo(data);
          return;
        }

        loadContents();
      } catch (error) {
        ui.setCreateError(error.message || "Errore di rete");
      }
    });
  }

  const titleEl = document.getElementById("contentTitle");
  const tagsEl = document.getElementById("contentTags");
  if (titleEl && tagsEl) {
    const triggerCreateOnEnter = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (dom.createBtn) dom.createBtn.click();
      }
    };
    titleEl.addEventListener("keydown", triggerCreateOnEnter);
    tagsEl.addEventListener("keydown", triggerCreateOnEnter);
  }

  ui.setActiveCreateType(state.currentCreateType);
};