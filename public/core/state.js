export const PERMISSION_MATRIX = {
  movie: ["movie", "box"],
  music: ["music", "box"],
  note: ["note", "todo_list", "recipe", "box"],
  todo_list: ["todo_list", "note", "box"],
  recipe: ["recipe", "note", "box"],
  root: ["note", "todo_list", "recipe", "movie", "music", "box"]
};

export const state = {
  currentParentId: "root",
  navigationHistory: [],
  currentParentConstraint: null,
  activeFolder: null,
  lastContents: [],
  currentCreateType: "note",
  contextTarget: null,
};

export const setState = (patch) => {
  Object.assign(state, patch);
};

export const pushHistory = (entry) => {
  state.navigationHistory.push(entry);
};

export const popHistory = () => state.navigationHistory.pop();
