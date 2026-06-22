export const normalizeCreateType = (value) => {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase();
  if (["note", "notes", "pensiero", "pensieri", "nota", "notas"].includes(raw)) {
    return "note";
  }
  if (["todo", "to-do", "todo_list", "task", "tasks", "lista"].includes(raw)) {
    return "todo_list";
  }
  if (["movie", "movies", "film", "films"].includes(raw)) {
    return "movie";
  }
  if (["recipe", "recipes", "ricetta", "ricette"].includes(raw)) {
    return "recipe";
  }
  return null;
};

export const deriveConstraintFromBox = (item) => {
  if (!item || item.type !== "box") return null;
  const explicit = item?.payload?.allowed_type || item?.payload?.content_type;
  const normalizedExplicit = normalizeCreateType(explicit);
  if (normalizedExplicit) return normalizedExplicit;

  const title = (item.title || "").toLowerCase();
  if (/(film|movie)/.test(title)) return "movie";
  if (/(pensier|note|nota)/.test(title)) return "note";
  if (/(todo|to-do|task|lista)/.test(title)) return "todo_list";
  if (/(ricett|recipe|cucin)/.test(title)) return "recipe";
  return null;
};
