const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
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

export function getItems() {
  return request("/api/items");
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
