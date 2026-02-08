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
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Participant {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

interface Submission {
  id: string
  number: number
  title: string | null
  devpost_url: string
  prizes: string[]
}

export function ParticipantDetail({ id }: { id: string }) {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .select("id, email, first_name, last_name")
        .eq("id", id)
        .single()

      if (participantError) {
        toast.error("Failed to fetch participant")
        console.error(participantError)
        setLoading(false)
        return
      }

      setParticipant(participantData)
      window.dispatchEvent(
        new CustomEvent("breadcrumbLabel", { detail: participantData.email })
      )

      const { data: submissionData, error: submissionError } = await supabase
        .from("submission_participants")
        .select("submissions(id, number, title, devpost_url, prizes)")
        .eq("participant_id", id)

      if (submissionError) {
        toast.error("Failed to fetch projects")
        console.error(submissionError)
        setLoading(false)
        return
      }

      const projects = (submissionData || [])
        .map(
          (sp: Record<string, unknown>) => sp.submissions as Submission | null
        )
        .filter(Boolean) as Submission[]

      projects.sort((a, b) => a.number - b.number)
      setSubmissions(projects)
      setLoading(false)
    }

    fetchData()
  }, [id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Participant Details</h1>
      </div>

      <Card className="max-w-3xl shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">
              First Name
            </Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? "" : participant?.first_name || "—"}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">
              Last Name
            </Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? "" : participant?.last_name || "—"}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="min-w-[120px] text-sm font-medium">Email</Label>
            <div className="max-w-md flex-1 text-sm">
              {loading ? "" : participant?.email || "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] pl-6">#</TableHead>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead className="w-[40%]">Prizes</TableHead>
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
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="py-3 pl-6 font-mono text-muted-foreground">
                      {s.number}
                    </TableCell>
                    <TableCell className="py-3 font-medium">
                      {s.title || "Untitled"}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.prizes.map((prize) => (
                          <Badge key={prize} variant="secondary">
                            {prize}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Link href={`/dashboard/projects/${s.id}`}>
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
