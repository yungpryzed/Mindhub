// Modulo Isolato: Genera la Tree View in stile VS Code senza impattare la griglia principale.
export const buildTreeView = (flatData, currentFolderId = null) => {
  const folders = flatData.filter(item => item.type === "box");
  
  const folderMap = new Map();
  folders.forEach(folder => {
    folderMap.set(String(folder.id), { ...folder, children: [] });
  });

  const openFolderIds = new Set();
  let currId = String(currentFolderId);
  while (currId && currId !== "root" && currId !== "null" && folderMap.has(currId)) {
    openFolderIds.add(currId);
    currId = String(folderMap.get(currId).parent_id);
  }

  const roots = [];
  folderMap.forEach(node => {
    const parentId = String(node.parent_id);
    if (node.parent_id && node.parent_id !== "root" && node.parent_id !== "null" && folderMap.has(parentId)) {
      folderMap.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const renderNode = (node) => {
    const hasChildren = node.children.length > 0;
    const isCurrent = String(node.id) === String(currentFolderId);
    const isOpen = openFolderIds.has(String(node.id));

    const wrapper = document.createElement(hasChildren ? "details" : "div");
    wrapper.className = "tree-node";
    if (hasChildren && isOpen) {
      wrapper.setAttribute("open", "");
    }

    const dropzone = document.createElement(hasChildren ? "summary" : "div");
    dropzone.className = `tree-dropzone${isCurrent ? " is-current" : ""}`;
    dropzone.setAttribute("data-folder-id", node.id);

    const icon = document.createElement("i");
    // Utilizza la cartella aperta nativa di bootstrap-icons se è "is-current" o in base all'espansione
    icon.className = `bi bi-folder${isCurrent ? '2-open' : ''}-fill tree-icon tree-passthrough`;

    const label = document.createElement("span");
    label.className = "tree-label tree-passthrough";
    label.textContent = node.title || "Senza Titolo";

    dropzone.appendChild(icon);
    dropzone.appendChild(label);
    wrapper.appendChild(dropzone);

    if (hasChildren) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-children";
      node.children.forEach(child => {
        childrenContainer.appendChild(renderNode(child));
      });
      wrapper.appendChild(childrenContainer);
    }

    return wrapper;
  };

  const treeRoot = document.createElement("div");
  treeRoot.className = "tree-root";
  
  if (roots.length === 0) {
    return treeRoot; // Albero vuoto se non ci sono cartelle root
  }

  roots.forEach(rootNode => {
    treeRoot.appendChild(renderNode(rootNode));
  });

  return treeRoot;
};