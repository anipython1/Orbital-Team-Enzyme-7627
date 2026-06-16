import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, GraduationCap, FolderKanban, Users, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { api } from "@/lib/api"

/**
 * Admin Statistics page

 */
export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    api.getStats().then(setStats).catch((err) => setError(err.message))
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
            <Link to="/">
              <ArrowLeft /> Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="mt-1 text-muted-foreground">
          An overview of projects, users, and topics on FindMyFYP.
        </p>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4">
                  <FolderKanban className="size-8 text-muted-foreground" />
                  <div>
                    <div className="text-3xl font-bold">{stats.total_projects}</div>
                    <div className="text-sm text-muted-foreground">Total Projects</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4">
                  <Users className="size-8 text-muted-foreground" />
                  <div>
                    <div className="text-3xl font-bold">{stats.total_users}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4">
                  <Tags className="size-8 text-muted-foreground" />
                  <div>
                    <div className="text-3xl font-bold">{stats.total_keywords}</div>
                    <div className="text-sm text-muted-foreground">Unique Keywords</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Users by role */}
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>How the registered users break down.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {Object.keys(stats.users_by_role).length === 0 && (
                    <p className="text-sm text-muted-foreground">No users yet.</p>
                  )}
                  {Object.entries(stats.users_by_role).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="capitalize">{role}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Keywords</CardTitle>
                  <CardDescription>Topics across all projects.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {stats.top_keywords.length === 0 && (
                    <p className="text-sm text-muted-foreground">No keywords yet.</p>
                  )}
                  {stats.top_keywords.map((k) => (
                    <Badge key={k.keyword} variant="outline">
                      {k.keyword} ({k.count})
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
