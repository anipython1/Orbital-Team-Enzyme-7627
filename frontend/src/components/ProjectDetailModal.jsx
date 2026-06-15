import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Colour of the difficulty badge 
const difficultyVariant = {
  Beginner: "secondary",
  Intermediate: "outline",
  Advanced: "destructive",
}


function toList(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function Section({ title, children }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

// A row of badges 
function BadgeList({ value, variant = "secondary" }) {
  const items = toList(value)
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant={variant}>
          {item}
        </Badge>
      ))}
    </div>
  )
}

/*
 A popup that shows the full details of a single project in clean sections.
 Pass the project to show, or null for nothing.
 */
export default function ProjectDetailModal({ project, onClose }) {
  if (!project) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-6">
          <div className="grid gap-1">
            <h2 className="text-xl font-bold">{project.title}</h2>
            <p className="text-sm text-muted-foreground">
              Supervisor: {project.supervisor_name}
            </p>
            <Badge
              className="mt-1"
              variant={difficultyVariant[project.difficulty] || "outline"}
            >
              {project.difficulty}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </Button>
        </div>

        {/* Body */}
        <div className="grid gap-6 overflow-y-auto p-6">
          <Section title="Project Description">
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </Section>

          <Section title="Technical Skills">
            <BadgeList value={project.required_skills} />
          </Section>

          <Section title="Languages">
            <BadgeList value={project.languages} variant="outline" />
          </Section>

          <Section title="Prerequisite Knowledge">
            <p className="text-sm text-muted-foreground">
              {project.prerequisite_knowledge || "Not specified"}
            </p>
          </Section>

          <Section title="Expected Deliverables">
            <p className="text-sm text-muted-foreground">
              {project.expected_deliverables || "Not specified"}
            </p>
          </Section>

          <Section title="Domain Keywords">
            <BadgeList value={project.domain_keywords} variant="outline" />
          </Section>
        </div>
      </div>
    </div>
  )
}
