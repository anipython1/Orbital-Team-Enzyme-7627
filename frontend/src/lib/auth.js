// Very simple "session" handling: the logged-in user is kept in localStorage.

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser() {
  const stored = localStorage.getItem("user")
  return stored ? JSON.parse(stored) : null
}

export function logout() {
  localStorage.removeItem("user")
}
