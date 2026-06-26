import { dom } from "../../core/dom.js";
import { loadFolderDirectly } from "../../modules/appInit.js";

// --- TASK 1: Routing "Vedi Tutti" ---
export const initDashboardRouting = () => {
  const viewAllLinks = document.querySelectorAll('.view-all-link');
  const typeToFolderTitle = {
    'movie': ['Cinema', 'Film'],
    'album': ['Album', 'I Miei Album', 'Music'],
    'note': ['Appunti', 'Pensieri']
  };

  viewAllLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      const targetType = link.getAttribute('data-target-folder');
      const targetTitles = typeToFolderTitle[targetType] || [];
      const treeLabels = Array.from(document.querySelectorAll('.tree-label'));
      const targetLabel = treeLabels.find(l => 
        targetTitles.some(title => title.toLowerCase() === l.textContent.trim().toLowerCase())
      );

      console.log("DEBUG: TargetType=", targetType, "TargetTitles=", targetTitles, "TrovateLabel=", treeLabels.length);
      if (!targetLabel) {
        console.log("DEBUG - Tutte le label trovate:", treeLabels.map(l => l.textContent.trim()));
      }

      console.log("DEBUG CLICK:", {
        targetType: targetType,
        targetTitles: targetTitles,
        targetNodeFound: targetLabel ? targetLabel.textContent : "NOT FOUND"
      });
      
      if (targetTitles.length > 0) {
        if (targetLabel) {
          const dropzone = targetLabel.closest('.tree-dropzone');
          if (dropzone) {
            const folderId = dropzone.dataset.folderId;
            if (folderId && typeof loadFolderDirectly === 'function') {
              // 1. Pulisci la vista per evitare il flash della cartella root precedente
              const grid = document.querySelector('.content-grid');
              if (grid) grid.innerHTML = '';
              
              // 2. Torna alla vista "folders" con History API
              if (window.setHomeView) {
                window.setHomeView("folders", true);
              }
              
              // 3. Carica la cartella target passando `true` come fromDashboard
              loadFolderDirectly(folderId, true);
            }
          }
        }
      }
    });
  });
};

// --- TASK 2: Reordering Dashboard (Drag & Drop nativo) ---
export const initDashboardDragAndDrop = () => {
  const dashboardContainer = dom.viewDashboard;
  if (!dashboardContainer) return;

  const sections = Array.from(dashboardContainer.querySelectorAll('.dashboard-section[draggable="true"]'));
  
  // Ripristina l'ordine dal localStorage prima che l'utente interagisca
  const savedOrder = localStorage.getItem('mindhub_dashboard_order');
  if (savedOrder) {
    try {
      const orderArray = JSON.parse(savedOrder);
      orderArray.forEach(sectionId => {
        const section = dashboardContainer.querySelector(`.dashboard-section[data-section-id="${sectionId}"]`);
        if (section) {
          dashboardContainer.appendChild(section); // Sposta in fondo riordinando gli elementi
        }
      });
    } catch(e) {}
  }

  let draggedSection = null;

  sections.forEach(section => {
    section.addEventListener('dragstart', (e) => {
      draggedSection = section;
      e.dataTransfer.setData('text/plain', section.dataset.sectionId);
      e.dataTransfer.effectAllowed = 'move';
      
      setTimeout(() => {
        section.classList.add('is-dragging');
      }, 0);
    });

    section.addEventListener('dragend', () => {
      section.classList.remove('is-dragging');
      draggedSection = null;
      
      // Salva il nuovo ordine
      const newOrder = Array.from(dashboardContainer.querySelectorAll('.dashboard-section[draggable="true"]'))
                            .map(s => s.dataset.sectionId)
                            .filter(Boolean);
      localStorage.setItem('mindhub_dashboard_order', JSON.stringify(newOrder));
    });

    section.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (!draggedSection || draggedSection === section) return;
      
      const bounding = section.getBoundingClientRect();
      const offset = bounding.y + (bounding.height / 2);
      
      if (e.clientY < offset) {
        dashboardContainer.insertBefore(draggedSection, section);
      } else {
        dashboardContainer.insertBefore(draggedSection, section.nextSibling);
      }
    });

    section.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });

    section.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  });
};

export const initDashboardInteraction = () => {
  initDashboardRouting();
  initDashboardDragAndDrop();
};