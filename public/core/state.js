export const state = {
  currentParentId: "root",
  navigationHistory: [],
  currentParentConstraint: null,
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
