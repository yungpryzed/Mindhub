let currentOpenContent = null;
let currentTodoItems = [];
let todoSaveTimer = null;
let domRef = null;
let updateContentRef = null;
let showTodoRef = null; 

// SCUDO DIFENSIVO: Aggiunta la funzione mancante che causava il crash
const renderTodoProgress = () => {
  if (!domRef) return;
  const completedCount = currentTodoItems.filter((item) => item.done).length;
  
  if (domRef.todoClearCompletedBtn) {
    domRef.todoClearCompletedBtn.classList.toggle("hidden", completedCount === 0);
  }
};

const renderTodoItems = () => {
  if (!domRef) return;
  domRef.todoList.innerHTML = "";

  if (!currentTodoItems.length) {
    const empty = document.createElement("div");
    empty.className = "todo-empty text-secondary p-3 text-center";
    empty.textContent = "Nessuna attività. Premi + o inizia a digitare.";
    domRef.todoList.appendChild(empty);
    return;
  }

  currentTodoItems.forEach((item, index) => {
    const row = document.createElement("div");
    // Aggiunta classe 'todo-row-modern' per il restyling CSS
    row.className = "todo-item todo-row-modern d-flex align-items-center gap-2 mb-2 p-2 rounded";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input mt-0 custom-todo-check";
    checkbox.checked = item.done;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control form-control-sm todo-text custom-todo-input";
    input.value = item.text;
    input.placeholder = "Nuova attività...";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-sm text-danger todo-delete custom-todo-delete";
    deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';

    checkbox.addEventListener("change", () => {
      currentTodoItems[index].done = checkbox.checked;
      row.classList.toggle("done", checkbox.checked);
      renderTodoProgress();
      scheduleTodoSave();
    });

    input.addEventListener("input", () => {
      currentTodoItems[index].text = input.value;
      scheduleTodoSave();
    });

    // UX TASTIERA: Gestione Invio, Tab e Backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        const newIndex = index + 1;
        currentTodoItems.splice(newIndex, 0, {
          text: "",
          done: false,
          isNew: true,
        });
        renderTodoItems();

        const allInputs = domRef.todoList.querySelectorAll(".todo-text");
        if (allInputs[newIndex]) {
          allInputs[newIndex].focus();
        }
        scheduleTodoSave();
      }

      if (e.key === "Backspace" && input.value === "" && currentTodoItems.length > 1) {
        e.preventDefault();
        currentTodoItems.splice(index, 1);
        renderTodoItems();

        const prevIndex = index > 0 ? index - 1 : 0;
        const allInputs = domRef.todoList.querySelectorAll(".todo-text");
        if (allInputs[prevIndex]) {
          const prevInput = allInputs[prevIndex];
          prevInput.focus();
          const len = prevInput.value.length;
          prevInput.setSelectionRange(len, len);
        }
        scheduleTodoSave();
      }
    });

    deleteBtn.addEventListener("click", () => {
      currentTodoItems.splice(index, 1);
      renderTodoItems();
      scheduleTodoSave();
    });

    if (item.done) {
      row.classList.add("done");
    }

    row.appendChild(checkbox);
    row.appendChild(input);
    row.appendChild(deleteBtn);
    domRef.todoList.appendChild(row);
  });

  renderTodoProgress();
};

const scheduleTodoSave = () => {
  if (!currentOpenContent || !domRef || !updateContentRef) return;
  domRef.todoStatus.textContent = "Salvataggio...";
  clearTimeout(todoSaveTimer);
  todoSaveTimer = setTimeout(saveTodo, 600);
};

const saveTodo = async () => {
  if (!currentOpenContent || !domRef || !updateContentRef) return;
  const title = domRef.todoTitle.value.trim() || "(senza titolo)";
  const payload = { items: currentTodoItems };

  try {
    const updated = await updateContentRef(currentOpenContent.id, {
      title,
      payload,
    });
    currentOpenContent = updated;
    domRef.todoStatus.textContent = "Salvato";
  } catch (error) {
    domRef.todoStatus.textContent = "Errore salvataggio";
  }
};

export const openTodo = (item) => {
  if (!domRef || !showTodoRef) return;
  currentOpenContent = item;
  domRef.todoStatus.textContent = "";
  domRef.todoTitle.value = item.title || "";
  currentTodoItems = Array.isArray(item.payload?.items)
    ? item.payload.items.map((entry) => ({
        text: entry?.text || "",
        done: Boolean(entry?.done),
      }))
    : [];
  renderTodoItems();
  showTodoRef();
};

export const clearTodoState = () => {
  currentOpenContent = null;
  currentTodoItems = [];
};

export const initTodos = ({ dom, updateContent, showTodo }) => {
  domRef = dom;
  updateContentRef = updateContent;
  showTodoRef = showTodo;

  if (dom.todoTitle) {
    dom.todoTitle.addEventListener("input", scheduleTodoSave);
  }

  if (dom.todoAddBtn) {
    dom.todoAddBtn.addEventListener("click", () => {
      const newIndex = currentTodoItems.length;
      currentTodoItems.push({ text: "", done: false, isNew: true });
      renderTodoItems();

      const allInputs = domRef.todoList.querySelectorAll(".todo-text");
      if (allInputs[newIndex]) {
        allInputs[newIndex].focus();
      }
      scheduleTodoSave();
    });
  }

  if (dom.todoClearCompletedBtn) {
    dom.todoClearCompletedBtn.addEventListener("click", () => {
      currentTodoItems = currentTodoItems.filter((item) => !item.done);
      renderTodoItems();
      scheduleTodoSave();
    });
  }
};
