"use client"

import { PrizeBadge } from "@/components/prize-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, FolderOpen, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ParticipantInfo {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

interface Submission {
  id: string
  number: number
  title: string | null
  devpost_url: string
  prizes: string[]
  submission_participants: {
    participant_id: string
    participants: ParticipantInfo
  }[]
}

export function ChallengeDetail({ name }: { name: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("breadcrumbLabel", { detail: name }))

    const fetchData = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, number, title, devpost_url, prizes, submission_participants(participant_id, participants(id, first_name, last_name, email))"
        )
        .contains("prizes", [name])
        .order("number")

      if (error) {
        toast.error("Failed to fetch projects")
        console.error(error)
        setLoading(false)
        return
      }

      setSubmissions((data as unknown as Submission[]) || [])
      setLoading(false)
    }

    fetchData()
  }, [name])

  const uniqueParticipantCount = new Set(
    submissions.flatMap((s) =>
      s.submission_participants.map((sp) => sp.participant_id)
    )
  ).size

  const filteredSubmissions = submissions.filter((s) => {
    const term = searchTerm.toLowerCase()
    return (s.title || "").toLowerCase().includes(term)
  })

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSubmissions = filteredSubmissions.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Challenge Details</h1>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <PrizeBadge prize={name} />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" />
                  {submissions.length}{" "}
                  {submissions.length === 1 ? "project" : "projects"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {uniqueParticipantCount}{" "}
                  {uniqueParticipantCount === 1
                    ? "participant"
                    : "participants"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-sm shadow-none"
            />
            <div className="whitespace-nowrap text-sm text-muted-foreground">
              {filteredSubmissions.length}{" "}
              {filteredSubmissions.length === 1 ? "project" : "projects"}
            </div>
          </div>
        </div>

        <TooltipProvider>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] pl-6">#</TableHead>
                  <TableHead className="w-[35%]">Title</TableHead>
                  <TableHead className="w-[15%]">Team</TableHead>
                  <TableHead className="w-[35%]">Prizes</TableHead>
                  <TableHead className="w-[50px] text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-3 pl-6">
                        <Skeleton className="h-4 w-6" />
                      </TableCell>
                      <TableCell className="py-3">
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell className="py-3">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex gap-1">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubmissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="py-3 pl-6 font-mono text-muted-foreground">
                        {s.number}
                      </TableCell>
                      <TableCell className="max-w-0 py-3 font-medium">
                        <span className="block truncate">
                          {s.title || "Untitled"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default">
                              {s.submission_participants.length}{" "}
                              {s.submission_participants.length === 1
                                ? "member"
                                : "members"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              {s.submission_participants.map((sp) => (
                                <div key={sp.participant_id}>
                                  <div className="font-medium">
                                    {[
                                      sp.participants.first_name,
                                      sp.participants.last_name
                                    ]
                                      .filter(Boolean)
                                      .join(" ") || "—"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {sp.participants.email}
                                  </div>
                                </div>
                              ))}
                              {s.submission_participants.length === 0 && (
                                <div className="text-xs text-muted-foreground">
                                  No team members
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.prizes.map((prize) => (
                            <PrizeBadge key={prize} prize={prize} />
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
        </TooltipProvider>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
