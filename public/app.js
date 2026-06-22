import { initApp } from "./modules/appInit.js";
import { dom } from "./core/dom.js";

const bootstrap = async () => {
  try {
    await initApp();
  } catch (error) {
    console.error("Errore critico durante l'inizializzazione dell'app", error);
  }
};

const initViewSwitcher = () => {
  const toggleBtn = dom.homeViewToggle;
  const viewFolders = dom.viewFolders;
  const viewDashboard = dom.viewDashboard;

  if (!toggleBtn || !viewFolders || !viewDashboard) return;

  let currentView = localStorage.getItem("mindhub_home_view") || "folders";

  const applyView = (view) => {
    if (view === "dashboard") {
      viewFolders.classList.add("hidden");
      viewDashboard.classList.remove("hidden");
      toggleBtn.textContent = "📊";
    } else {
      viewFolders.classList.remove("hidden");
      viewDashboard.classList.add("hidden");
      toggleBtn.textContent = "📁";
    }
  };

  applyView(currentView);

  toggleBtn.addEventListener("click", () => {
    currentView = currentView === "folders" ? "dashboard" : "folders";
    localStorage.setItem("mindhub_home_view", currentView);
    applyView(currentView);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initViewSwitcher();
    bootstrap();
  });
} else {
  initViewSwitcher();
  bootstrap();
}