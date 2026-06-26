import { initApp } from "./modules/appInit.js";
import { dom } from "./core/dom.js";
import { initDashboardInteraction } from "./features/dashboard/dashboardInteraction.js";

const bootstrap = async () => {
  try {
    await initApp();
    initDashboardInteraction();
  } catch (error) {
    console.error("Errore critico durante l'inizializzazione dell'app", error);
  }
};

const initViewSwitcher = () => {
  const toggleBtn = dom.homeViewToggle;
  const viewFolders = dom.viewFolders;
  const viewDashboard = dom.viewDashboard;

  if (!toggleBtn || !viewFolders || !viewDashboard) return;

  let currentView = "dashboard"//localStorage.getItem("mindhub_home_view") || "dashboard";

  const applyView = (view, saveHistory = false) => {
    if (view === "dashboard") {
      viewFolders.classList.add("hidden");
      viewDashboard.classList.remove("hidden");
      toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>';
      if (saveHistory) history.replaceState({ view: "dashboard" }, "", "/");
    } else {
      viewFolders.classList.remove("hidden");
      viewDashboard.classList.add("hidden");
      toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
      if (saveHistory) history.pushState({ view: "folders" }, "", "#folders");
    }
  };

  // Esponi per l'uso esterno (es. click su Vedi Tutti)
  window.setHomeView = (v, saveHistory = true) => {
    if (currentView === v) return;
    currentView = v;
    localStorage.setItem("mindhub_home_view", currentView);
    applyView(currentView, saveHistory);
  };

  applyView(currentView, false);
  // Forza lo stato iniziale in History
  history.replaceState({ view: currentView }, "", currentView === 'dashboard' ? '/' : '#folders');

  toggleBtn.addEventListener("click", () => {
    currentView = currentView === "folders" ? "dashboard" : "folders";
    localStorage.setItem("mindhub_home_view", currentView);
    applyView(currentView, true);
  });

  window.addEventListener('popstate', (e) => {
    console.log("DEBUG POPSTATE:", {
      state: e.state,
      currentView: currentView,
      locationHash: window.location.hash
    });
    
    const state = e.state;
    if (!state || state.view === "dashboard") {
      currentView = "dashboard";
      localStorage.setItem("mindhub_home_view", "dashboard");
      applyView("dashboard", false);
    } else if (state && state.view === "folders") {
      currentView = "folders";
      localStorage.setItem("mindhub_home_view", "folders");
      applyView("folders", false);
    }
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