// Small helper for talking to the FastAPI backend.
//
// In production set VITE_API
// Falls back to the local FastAPI dev server 
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Convenience wrapper for JSON POST requests.
const post = (body) => ({ method: "POST", body: JSON.stringify(body) })

// Generic request helper
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
  register: (user) => request("/register", post(user)),
  login: (credentials) => request("/login", post(credentials)),
  getProjects: () => request("/projects"),
  createProject: (project) => request("/projects", post(project)),
  matchProjects: (profile) => request("/match", post(profile)),
  getStats: () => request("/stats"),
}
