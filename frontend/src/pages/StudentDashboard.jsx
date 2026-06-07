import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GraduationCap, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ProjectCard from "@/components/ProjectCard"
import { api } from "@/lib/api"
import { getUser, logout } from "@/lib/auth"

export default function StudentDashboard() {
  const navigate = useNavigate()
  const user = getUser()

  const [skillsHave, setSkillsHave] = useState("")
  const [skillsWant, setSkillsWant] = useState("")
  const [interests, setInterests] = useState("")
  const [results, setResults] = useState(null) // null = not searched yet
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // If nobody is logged in, send them to the login page.
  useEffect(() => {
    if (!user) navigate("/login")
  }, [user, navigate])

  if (!user) return null

  function handleLogout() {
    logout()
    navigate("/")
  }

  async function handleFindProjects(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const matches = await api.matchProjects({
        skills_have: skillsHave,
        skills_want: skillsWant,
        interests: interests,
      })
      setResults(matches)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="size-6" />
            FindMyFYP
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Welcome message */}
        <h1 className="text-2xl font-bold">Welcome, {user.name}! 👋</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us about yourself and we&apos;ll find projects that match.
        </p>

        {/* Profile form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Separate each item with a comma, e.g. &quot;Python, SQL, Web Development&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFindProjects} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="skillsHave">Skills I have</Label>
                <Input
                  id="skillsHave"
                  placeholder="e.g. Python, JavaScript, SQL"
                  value={skillsHave}
                  onChange={(e) => setSkillsHave(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skillsWant">Skills I want to learn</Label>
                <Input
                  id="skillsWant"
                  placeholder="e.g. Machine Learning, React"
                  value={skillsWant}
                  onChange={(e) => setSkillsWant(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interests">Interests</Label>
                <Input
                  id="interests"
                  placeholder="e.g. healthcare, education, chatbots"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={loading} className="w-fit">
                <Search />
                {loading ? "Searching..." : "Find Matching Projects"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Matching results */}
        {results && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">
              Matching Projects ({results.length})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sorted by best match first.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {results.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
