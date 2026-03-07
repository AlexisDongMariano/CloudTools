const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getItems(includeDeleted = false) {
  const query = includeDeleted ? "?include_deleted=true" : "";
  return request(`/api/items${query}`);
}

export function getSummary() {
  return request("/api/items/summary");
}

export function createItem(payload) {
  return request("/api/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateItem(itemId, payload) {
  return request(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteItem(itemId) {
  return request(`/api/items/${itemId}`, {
    method: "DELETE",
  });
}

export function restoreItem(itemId) {
  return request(`/api/items/${itemId}/restore`, {
    method: "POST",
  });
}

export function getItemHistory(itemId) {
  return request(`/api/items/${itemId}/history`);
}
