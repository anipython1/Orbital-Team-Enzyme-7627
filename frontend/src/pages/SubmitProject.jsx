import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { getUser } from "@/lib/auth"

const EMPTY_FORM = {
  title: "",
  supervisor_name: "",
  contact_email: "",
  difficulty: "",
  description: "",
  required_skills: "",
  languages: "",
  prerequisite_knowledge: "",
  expected_deliverables: "",
  domain_keywords: "",
}

/**
 * Page where supervisors submit a new project, and where they edit one they
 * already submitted. The same form serves both:
 *   /submit-project      -> create
 *   /edit-project/:id    -> edit an existing project
 */
export default function SubmitProject() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  // getUser() builds a new object each render, so depend on the email string
  // rather than the object — otherwise the effect below would re-run forever.
  const userEmail = getUser()?.email || ""

  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // While editing we wait for the existing project before showing the form.
  const [loadingProject, setLoadingProject] = useState(isEditing)

  // Load the project being edited and pre-fill the form with it.
  useEffect(() => {
    if (!isEditing) return
    let active = true

    api
      .getProject(id)
      .then((project) => {
        if (!active) return
        // Only the supervisor who submitted the project may edit it. The
        // backend enforces this too — this check just avoids showing a form
        // that could never be saved.
        const owner = (project.contact_email || "").toLowerCase()
        if (!userEmail || owner !== userEmail.toLowerCase()) {
          setError("You can only edit your own projects.")
          return
        }
        setForm({
          title: project.title,
          supervisor_name: project.supervisor_name,
          contact_email: project.contact_email,
          difficulty: project.difficulty,
          description: project.description,
          required_skills: project.required_skills,
          languages: project.languages,
          prerequisite_knowledge: project.prerequisite_knowledge,
          expected_deliverables: project.expected_deliverables,
          domain_keywords: project.domain_keywords,
        })
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoadingProject(false))

    return () => {
      active = false
    }
  }, [id, isEditing, userEmail])

  // Update one field of the form.
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    // Basic validation 
    if (form.title.trim().length < 3) {
      setError("Please enter a project title.")
      return
    }
    if (form.supervisor_name.trim().length < 2) {
      setError("Please enter the supervisor name.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      setError("Please enter a valid contact email.")
      return
    }
    if (!form.difficulty) {
      setError("Please select a difficulty level.")
      return
    }
    if (form.description.trim().length < 10) {
      setError("Please enter a project description.")
      return
    }
    if (!form.required_skills.trim()) {
      setError("Please list the technical skills required.")
      return
    }

    // Call  backend
    setLoading(true)
    try {
      if (isEditing) {
        await api.updateProject(id, form, userEmail)
        navigate("/dashboard")
      } else {
        await api.createProject(form)
        navigate("/explore")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Editing a project we could not load (missing, or not ours).
  if (isEditing && !loadingProject && !form.title) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Cannot edit this project</CardTitle>
            <CardDescription>{error || "Project not found."}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft /> Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="size-6" />
            FindMyFYP
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={isEditing ? "/dashboard" : "/"}>
              <ArrowLeft /> {isEditing ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditing ? "Edit Project" : "Submit a Project"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the details below. Students will see your changes straight away."
                : "Supervisors: fill in the details below to add your project to the explorer."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Smart Attendance System using Face Recognition"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supervisor_name">Supervisor Name</Label>
                <Input
                  id="supervisor_name"
                  placeholder="e.g. Dr. Aisha Rahman"
                  value={form.supervisor_name}
                  onChange={(e) => update("supervisor_name", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact_email">
                  Your Email (for students to contact you)
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="e.g. aisha.rahman@university.edu"
                  value={form.contact_email}
                  onChange={(e) => update("contact_email", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(value) => update("difficulty", value)}
                >
                  <SelectTrigger id="difficulty" className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what the project is about and what the student will build."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="required_skills">Technical Skills Required</Label>
                <Input
                  id="required_skills"
                  placeholder="Comma separated, e.g. Python, OpenCV, Machine Learning"
                  value={form.required_skills}
                  onChange={(e) => update("required_skills", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="languages">Languages Used</Label>
                <Input
                  id="languages"
                  placeholder="Comma separated, e.g. Python, JavaScript"
                  value={form.languages}
                  onChange={(e) => update("languages", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prerequisite_knowledge">
                  Prerequisite Knowledge
                </Label>
                <Textarea
                  id="prerequisite_knowledge"
                  placeholder="What should a student already know before starting?"
                  value={form.prerequisite_knowledge}
                  onChange={(e) =>
                    update("prerequisite_knowledge", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expected_deliverables">
                  Expected Deliverables
                </Label>
                <Textarea
                  id="expected_deliverables"
                  placeholder="What is the student expected to produce?"
                  value={form.expected_deliverables}
                  onChange={(e) =>
                    update("expected_deliverables", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="domain_keywords">Domain Keywords</Label>
                <Input
                  id="domain_keywords"
                  placeholder="Comma separated, e.g. Computer Vision, Biometrics"
                  value={form.domain_keywords}
                  onChange={(e) => update("domain_keywords", e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading
                    ? isEditing
                      ? "Saving..."
                      : "Submitting..."
                    : isEditing
                    ? "Save Changes"
                    : "Submit Project"}
                </Button>
                {isEditing && (
                  <Button variant="outline" type="button" asChild>
                    <Link to="/dashboard">Cancel</Link>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
