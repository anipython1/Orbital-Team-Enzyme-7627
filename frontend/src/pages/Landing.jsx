import { Link } from "react-router-dom"
import { GraduationCap, Sparkles, Target, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="size-6" />
            FindMyFYP
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          FindMyFYP
        </h1>
        <p className="mt-4 text-xl font-medium text-muted-foreground sm:text-2xl">
          Find the right project. Build the right skills.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          FindMyFYP helps students discover Final Year Projects that fit
          their skills and interests. Tell us what you know and what you want
          to learn, and we&apos;ll match you with the most suitable projects
          and supervisors.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Register</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/explore">Explore Projects</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/submit-project">Submit Project (For supervisors)</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Target className="size-8" />
              <h3 className="font-semibold">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">
                Projects are scored against your skills and interests, so the
                best fits appear first.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Sparkles className="size-8" />
              <h3 className="font-semibold">Grow Your Skills</h3>
              <p className="text-sm text-muted-foreground">
                Tell us what you want to learn and find projects that help you
                get there.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Users className="size-8" />
              <h3 className="font-semibold">For Everyone</h3>
              <p className="text-sm text-muted-foreground">
                Students discover projects, supervisors share ideas, admins
                keep it all organised.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
