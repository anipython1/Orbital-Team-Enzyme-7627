// Small helper for talking to the FastAPI backend.
//
// In production set VITE_API
// Falls back to the local FastAPI dev server 
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Convenience wrappers for JSON requests that carry a body.
const post = (body) => ({ method: "POST", body: JSON.stringify(body) })
const put = (body) => ({ method: "PUT", body: JSON.stringify(body) })

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
  getProject: (id) => request(`/projects/${id}`),
  // owner_email is the supervisor's account email. It is what makes the project
  // theirs the contact_email on the form is only what students see, and may
  // be a different address
  createProject: (project, ownerEmail) =>
    request("/projects", post({ ...project, owner_email: ownerEmail })),
  // The supervisor's own email is sent along so the backend can check they own
  // the project before changing or removing it.
  updateProject: (id, project, requesterEmail) =>
    request(`/projects/${id}`, put({ ...project, requester_email: requesterEmail })),
  deleteProject: (id, requesterEmail) =>
    request(`/projects/${id}?requester_email=${encodeURIComponent(requesterEmail)}`, {
      method: "DELETE",
    }),
  matchProjects: (profile) => request("/match", post(profile)),
  getStats: () => request("/stats"),
}
