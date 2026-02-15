"use client"

import { EditProjectSheet } from "@/components/edit-project-sheet"
import { PrizeBadge } from "@/components/prize-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, ExternalLink, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("submissions").delete().eq("id", id)
    setDeleting(false)

    if (error) {
      toast.error("Failed to delete project")
      console.error(error)
      return
    }

    toast.success("Project deleted")
    router.push("/dashboard/projects")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Details</h1>
        {!loading && submission && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditSheetOpen(true)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card className="shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Title
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                submission?.title || "Untitled"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              DevPost URL
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-56" />
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
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Video
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-56" />
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
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Repository
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-56" />
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
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Demo
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-56" />
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
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Prizes
            </Label>
            <div className="flex-1">
              {loading ? (
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ) : submission?.prizes && submission.prizes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {submission.prizes.map((prize) => (
                    <PrizeBadge key={prize} prize={prize} />
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
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-3 pl-6">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
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

      {submission && (
        <EditProjectSheet
          key={`${submission.id}-${submission.title}-${submission.devpost_url}-${teamMembers.map((m) => m.id).join(",")}`}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          submission={submission}
          initialTeamMembers={teamMembers}
          onUpdated={fetchData}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all team member
              associations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
