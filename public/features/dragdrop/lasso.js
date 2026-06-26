/**
 * Gestisce la logica del "Lasso Tool" (Rettangolo di selezione multipla)
 */
export const initLassoSelection = ({ mainContent, contentGrid }) => {
  if (!mainContent || !contentGrid) return;

  const lassoEl = document.createElement("div");
  lassoEl.className = "selection-marquee";
  document.body.appendChild(lassoEl);

  let isLassoing = false;
  let startX = 0, startY = 0;

  mainContent.addEventListener("mousedown", (e) => {
    // Ignora click su elementi interattivi
    if (
      e.button !== 0 ||
      e.target.closest('.content-tile') ||
      e.target.closest('button') ||
      e.target.closest('.create-form') ||
      e.target.closest('.sidebar-drawer') ||
      e.target.closest('.fixed-nav-controls')
    ) return;

    const viewDashboard = document.getElementById("view-dashboard");
    if (viewDashboard && !viewDashboard.classList.contains("hidden")) {
      return;
    }

    isLassoing = true;
    startX = e.clientX;
    startY = e.clientY;

    lassoEl.style.left = startX + "px";
    lassoEl.style.top = startY + "px";
    lassoEl.style.width = "0px";
    lassoEl.style.height = "0px";
    lassoEl.style.display = "block";

    // Se non stiamo tenendo premuto Ctrl/Cmd, resetta le selezioni vecchie
    if (!e.ctrlKey && !e.metaKey) {
      contentGrid.querySelectorAll(".content-tile.is-selected").forEach(el => el.classList.remove("is-selected"));
    }

    // Memorizza lo stato iniziale di ogni tile (per il Ctrl+Lasso)
    const tileData = Array.from(contentGrid.querySelectorAll(".content-tile")).map(el => ({
      el,
      wasSelected: el.classList.contains("is-selected")
    }));

    const onMouseMove = (moveEvent) => {
      if (!isLassoing) return;
      moveEvent.preventDefault();

      const x = Math.min(startX, moveEvent.clientX);
      const y = Math.min(startY, moveEvent.clientY);
      const w = Math.abs(startX - moveEvent.clientX);
      const h = Math.abs(startY - moveEvent.clientY);

      lassoEl.style.left = `${x}px`;
      lassoEl.style.top = `${y}px`;
      lassoEl.style.width = `${w}px`;
      lassoEl.style.height = `${h}px`;

      tileData.forEach(({ el, wasSelected }) => {
        const rect = el.getBoundingClientRect();
        const intersect = !(rect.right < x || rect.left > x + w || rect.bottom < y || rect.top > y + h);
        
        if (intersect) {
          el.classList.add("is-selected");
        } else {
          el.classList.toggle("is-selected", wasSelected && (moveEvent.ctrlKey || moveEvent.metaKey));
        }
      });
    };

    const onMouseUp = () => {
      if (!isLassoing) return;
      isLassoing = false;
      lassoEl.style.display = "none";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
};