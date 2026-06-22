let currentOpenContent = null;
let noteSaveTimer = null;
let quill = null;
let domRef = null;
let updateContentRef = null;
let showNoteRef = null;

const initQuill = () => {
  if (quill) return;
  quill = new Quill("#noteEditor", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    },
  });

  quill.on("text-change", () => {
    scheduleNoteSave();
  });

  const toolbar = document.querySelector(".ql-toolbar");
  if (toolbar) {
    const tooltipMap = {
      bold: "Grassetto",
      italic: "Corsivo",
      underline: "Sottolineato",
      strike: "Barrato",
      blockquote: "Citazione",
      "code-block": "Blocco codice",
      link: "Inserisci link",
      clean: "Pulisci formattazione",
    };

    Object.entries(tooltipMap).forEach(([format, label]) => {
      const btn = toolbar.querySelector(`.ql-${format}`);
      if (btn) {
        btn.setAttribute("title", label);
        btn.setAttribute("aria-label", label);
      }
    });

    const headerPicker = toolbar.querySelector(".ql-header");
    if (headerPicker) {
      headerPicker.setAttribute("title", "Titoli");
      headerPicker.setAttribute("aria-label", "Titoli");
    }

    const listButtons = toolbar.querySelectorAll(".ql-list");
    listButtons.forEach((btn) => {
      const value = btn.getAttribute("value");
      const label = value === "ordered" ? "Elenco numerato" : "Elenco puntato";
      btn.setAttribute("title", label);
      btn.setAttribute("aria-label", label);
    });
  }
};

const scheduleNoteSave = () => {
  if (!currentOpenContent || !domRef || !updateContentRef) return;
  domRef.noteStatus.textContent = "Salvataggio...";
  clearTimeout(noteSaveTimer);
  noteSaveTimer = setTimeout(saveNote, 600);
};

const saveNote = async () => {
  if (!currentOpenContent || !domRef || !updateContentRef) return;
  const html = quill.root.innerHTML;
  const title = domRef.noteTitle.value.trim() || "(senza titolo)";

  try {
    const updated = await updateContentRef(currentOpenContent.id, {
      title,
      payload: { html },
    });
    currentOpenContent = updated;
    domRef.noteStatus.textContent = "Salvato";
  } catch (error) {
    domRef.noteStatus.textContent = "Errore salvataggio";
  }
};

export const openNote = (item) => {
  if (!domRef || !showNoteRef) return;
  initQuill();
  currentOpenContent = item;
  domRef.noteStatus.textContent = "";
  domRef.noteTitle.value = item.title || "";
  const html = item.payload?.html || "";
  quill.setContents(quill.clipboard.convert(html));
  showNoteRef();
};

export const clearNoteState = () => {
  currentOpenContent = null;
};

export const initNotes = ({ dom, updateContent, showNote }) => {
  domRef = dom;
  updateContentRef = updateContent;
  showNoteRef = showNote;

  dom.noteView.addEventListener("click", () => {
    initQuill();
  });

  dom.noteTitle.addEventListener("input", () => {
    scheduleNoteSave();
  });
};
