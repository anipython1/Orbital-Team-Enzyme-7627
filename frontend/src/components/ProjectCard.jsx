import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Colour of the difficulty badge depends on the level.
const difficultyVariant = {
  Beginner: "secondary",
  Intermediate: "outline",
  Advanced: "destructive",
}


export default function ProjectCard({ project, onClick }) {
  const skills = project.required_skills.split(",").map((s) => s.trim())
  const hasScore = project.match_score !== undefined

  return (
    <Card
      className={
        "gap-4" +
        (onClick
          ? " cursor-pointer transition-shadow hover:shadow-md hover:border-primary/40"
          : "")
      }
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{project.title}</CardTitle>
          {hasScore && (
            <Badge className="shrink-0">{project.match_score}% match</Badge>
          )}
        </div>
        <CardDescription>Supervisor: {project.supervisor_name}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={difficultyVariant[project.difficulty] || "outline"}>
            {project.difficulty}
          </Badge>
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>

        {hasScore && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${project.match_score}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
