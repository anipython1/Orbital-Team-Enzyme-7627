// Small helper for talking to the FastAPI backend.

const API_URL = "http://localhost:8000/api"

// Generic request helper: throws an Error with the backend's message on failure.
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong.")
  }
  return data
}

export const api = {
  register: (user) => request("/register", { method: "POST", body: JSON.stringify(user) }),
  login: (credentials) => request("/login", { method: "POST", body: JSON.stringify(credentials) }),
  getProjects: () => request("/projects"),
  matchProjects: (profile) => request("/match", { method: "POST", body: JSON.stringify(profile) }),
}
