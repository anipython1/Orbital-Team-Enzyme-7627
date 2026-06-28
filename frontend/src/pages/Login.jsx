import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GraduationCap, User, Briefcase, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { saveUser } from "@/lib/auth"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("") // chosen first: student / supervisor / admin

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    // --- Basic validation ---
    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    // --- Call the backend ---
    setLoading(true)
    try {
      const user = await api.login({ email, password })
      saveUser(user)
      // Admins manage the platform, so they go straight to Statistics
     
      navigate(user.role === "admin" ? "/statistics" : "/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: choose a role before showing the login
  if (!role) {
    const roles = [
      { value: "student", label: "Student", icon: User },
      { value: "supervisor", label: "Supervisor", icon: Briefcase },
      { value: "admin", label: "Administrator", icon: ShieldCheck },
    ]
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Link to="/" className="mx-auto mb-2">
              <GraduationCap className="size-8" />
            </Link>
            <CardTitle className="text-2xl">Login as</CardTitle>
            <CardDescription>Choose your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {roles.map((r) => (
              <Button
                key={r.value}
                variant="outline"
                className="h-12 justify-start gap-3 text-base"
                onClick={() => setRole(r.value)}
              >
                <r.icon className="size-5" />
                {r.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-2">
            <GraduationCap className="size-8" />
          </Link>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Login to your FindMyFYP account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-foreground underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
