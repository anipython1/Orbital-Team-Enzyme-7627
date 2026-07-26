// Very simple "session" handling: the logged-in user is kept in localStorage.

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser() {
  try {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  } catch {
    // Storage blocked (private browsing) or a corrupted value treat as logged out.
    return null
  }
}


export function homePath(user) {
  if (!user) return "/"
  return user.role === "admin" ? "/statistics" : "/dashboard"
}

export function logout() {
  localStorage.removeItem("user")
}
