"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Submission {
  id: string
  number: number
  title: string | null
  devpost_url: string
  repo_url: string | null
  demo_url: string | null
  video_url: string | null
  prizes: string[]
}

interface TeamMember {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

export function ProjectDetail({ id }: { id: string }) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select(
          "id, number, title, devpost_url, repo_url, demo_url, video_url, prizes"
        )
        .eq("id", id)
        .single()

      if (submissionError) {
        toast.error("Failed to fetch project")
        console.error(submissionError)
        setLoading(false)
        return
      }

      setSubmission(submissionData)
      window.dispatchEvent(
        new CustomEvent("breadcrumbLabel", {
          detail: submissionData.title || `Project #${submissionData.number}`
        })
      )

      const { data: participantData, error: participantError } = await supabase
        .from("submission_participants")
        .select("participants(id, first_name, last_name, email)")
        .eq("submission_id", id)

      if (participantError) {
        toast.error("Failed to fetch team members")
        console.error(participantError)
        setLoading(false)
        return
      }

      const members = (participantData || [])
        .map(
          (sp: Record<string, unknown>) => sp.participants as TeamMember | null
        )
        .filter(Boolean) as TeamMember[]

      setTeamMembers(members)
      setLoading(false)
    }

    fetchData()
  }, [id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Details</h1>
      </div>

      <Card className="max-w-3xl shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">Title</Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? "" : submission?.title || "Untitled"}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">
              DevPost URL
            </Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? (
                ""
              ) : submission?.devpost_url ? (
                <a
                  href={submission.devpost_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {submission.devpost_url}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">Video</Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? (
                ""
              ) : submission?.video_url ? (
                <a
                  href={submission.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {submission.video_url}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">
              Repository
            </Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? (
                ""
              ) : submission?.repo_url ? (
                <a
                  href={submission.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {submission.repo_url}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">Demo</Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? (
                ""
              ) : submission?.demo_url ? (
                <a
                  href={submission.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {submission.demo_url}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">Prizes</Label>
            <div className="max-w-md flex-1">
              {loading ? (
                ""
              ) : submission?.prizes && submission.prizes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {submission.prizes.map((prize) => (
                    <Badge key={prize} variant="secondary">
                      {prize}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm">—</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%] pl-6">First Name</TableHead>
                <TableHead className="w-[25%]">Last Name</TableHead>
                <TableHead className="w-[40%]">Email</TableHead>
                <TableHead className="w-[50px] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : teamMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="py-3 pl-6 font-medium">
                      {m.first_name || "—"}
                    </TableCell>
                    <TableCell className="py-3">{m.last_name || "—"}</TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {m.email}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Link href={`/dashboard/participants/${m.id}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
