import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProjectCard from "@/components/ProjectCard"
import ProjectDetailModal from "@/components/ProjectDetailModal"
import { api } from "@/lib/api"
import { getUser, homePath } from "@/lib/auth"

/**
 * Shows all available projects (no login needed but stays session aware
 * so a logged in visitor is not sent back to the signed out landing page).
 */
export default function ExploreProjects() {
  const user = getUser()
  const [projects, setProjects] = useState([])
  const [error, setError] = useState("")
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    api
      .getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="size-6" />
            FindMyFYP
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={user ? homePath(user) : "/"}>
              <ArrowLeft /> {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">Explore Projects</h1>
        <p className="mt-1 text-muted-foreground">
          Browse all available Final Year Projects.
          {!user && " Register as a student to get personalised matches!"}
        </p>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </main>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}
