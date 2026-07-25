import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GraduationCap, LogOut, Search, FilePlus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ProjectCard from "@/components/ProjectCard"
import ProjectDetailModal from "@/components/ProjectDetailModal"
import ConfirmDialog from "@/components/ConfirmDialog"
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
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isSupervisor = user?.role === "supervisor"
  const isStudent = user?.role === "student"

  // Admins don't belong on the student dashboard — send them to Statistics.
  useEffect(() => {
    if (!user) navigate("/login")
    else if (user.role === "admin") navigate("/statistics")
  }, [user, navigate])

  // Supervisors don't fill in a profile
  useEffect(() => {
    if (!isSupervisor) return
    let active = true
    setLoading(true)
    api
      .getProjects()
      .then((projects) => active && setResults(projects))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isSupervisor])

  if (!user) return null

  // A supervisor owns a project when its contact email is theirs.
  const email = (user.email || "").toLowerCase()
  const owns = (project) => (project.contact_email || "").toLowerCase() === email
  const myProjects = isSupervisor && results ? results.filter(owns) : []
  const otherProjects = isSupervisor && results ? results.filter((p) => !owns(p)) : []

  function handleLogout() {
    logout()
    navigate("/")
  }

  async function handleDelete() {
    setError("")
    setDeleting(true)
    try {
      await api.deleteProject(projectToDelete.id, user.email)
      // Drop it from the list rather than re-fetching everything.
      setResults((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      setProjectToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleFindProjects(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const matches = await api.matchProjects({
        skills_have: skillsHave,
        skills_want: skillsWant,
        interests,
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
          {isSupervisor
            ? "Here are all the available projects."
            : isStudent
            ? "Tell us about yourself and we'll find projects that match."
            : ""}
        </p>

        {/* Profile form (students only — supervisors see all projects, admins see a blank page) */}
        {isStudent && (
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
        )}

        {/* Supervisors see their own projects (which they can edit or delete)
            separately from everyone else's. */}
        {results && isSupervisor && (
          <>
            <section className="mt-8">
              <h2 className="text-xl font-semibold">My Projects ({myProjects.length})</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Projects you submitted. You can edit or delete them.
              </p>

              {isSupervisor && error && (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              )}

              {myProjects.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  You have not submitted any projects yet.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {myProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => setSelectedProject(project)}
                      onEdit={(p) => navigate(`/edit-project/${p.id}`)}
                      onDelete={(p) => setProjectToDelete(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">
                Other Projects ({otherProjects.length})
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Projects submitted by other supervisors.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {otherProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Students see their ranked matches. */}
        {results && !isSupervisor && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Matching Projects ({results.length})</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sorted by best match first.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {results.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Supervisor: submit a project (shown below the available projects) */}
        {isSupervisor && (
          <Card
            className="mt-6 cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate("/submit-project")}
          >
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FilePlus className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">Submit a Project</p>
                  <p className="text-sm text-muted-foreground">For supervisors</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}
      </main>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ConfirmDialog
        open={Boolean(projectToDelete)}
        title="Delete this project?"
        message={`"${projectToDelete?.title}" will be removed permanently and students will no longer see it. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  )
}
