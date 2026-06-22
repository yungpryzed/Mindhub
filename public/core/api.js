const BASE_URL = typeof window !== 'undefined' && window.MINDHUB_API_URL
  ? window.MINDHUB_API_URL
  : "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("mindhub_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export const login = (email, password) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const fetchAllFolders = () => apiFetch("/contents/folders");

export const fetchAllContents = () => apiFetch("/contents/all");

export const fetchContents = (parentId) => {
  const endpoint = parentId && parentId !== "root"
    ? `/contents?parent_id=${encodeURIComponent(parentId)}`
    : "/contents";
  return apiFetch(endpoint);
};

export const fetchFolderPreview = async (folderId, limit = 6) => {
  const items = await apiFetch(`/contents?parent_id=${encodeURIComponent(folderId)}`);
  return Array.isArray(items) ? items.slice(0, limit) : [];
};

export const createContent = (payload) =>
  apiFetch("/contents", { method: "POST", body: JSON.stringify(payload) });

export const updateContent = (id, body) =>
  apiFetch(`/contents/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteContent = (id) =>
  apiFetch(`/contents/${encodeURIComponent(id)}`, { method: "DELETE" });

export const moveMultipleToFolder = (itemIds, targetFolderId) =>
  apiFetch("/contents/bulk-move", {
    method: "PUT",
    body: JSON.stringify({ itemIds, targetFolderId }),
  });

export const reorderContents = (items) =>
  apiFetch("/contents/reorder", { method: "PUT", body: JSON.stringify({ items }) });

export const mergeToFolder = (sourceId, targetId, itemType, folderTitle = "Cartella") =>
  apiFetch("/contents/merge-to-folder", {
    method: "POST",
    body: JSON.stringify({ source_id: sourceId, target_id: targetId, type: itemType, folder_title: folderTitle }),
  });

export const updateStatus = (id, status, position) =>
  apiFetch(`/contents/${encodeURIComponent(id)}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, position }),
  });

export const tmdbSearch = (query) =>
  apiFetch(`/tmdb/search?query=${encodeURIComponent(query)}`);

export const searchMusic = async (query, type = "album") => {
  const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${type}&limit=12`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("iTunes API request failed");
  }
  const data = await response.json();
  return data.results.map(item => ({
    id: item.collectionId,
    title: item.collectionName || item.trackName,
    artist: item.artistName,
    type: item.wrapperType,
    artworkUrl: item.artworkUrl100.replace('100x100bb', '600x600bb'),
    appleMusicUrl: item.collectionViewUrl,
  }));
};

