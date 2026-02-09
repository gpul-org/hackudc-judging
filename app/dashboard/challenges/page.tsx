"use client"

import { PrizeBadge } from "@/components/prize-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { FolderOpen, RefreshCw, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

interface Submission {
  id: string
  number: number
  title: string | null
  prizes: string[]
  submission_participants: {
    participant_id: string
  }[]
}

export default function ChallengesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSubmissions = useRef(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("submissions")
      .select(
        "id, number, title, prizes, submission_participants(participant_id)"
      )

    if (error) {
      toast.error("Failed to fetch challenges")
      console.error(error)
      return
    }

    setSubmissions((data as unknown as Submission[]) || [])
    setLoading(false)
  })

  useEffect(() => {
    fetchSubmissions.current()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSubmissions.current()
    setIsRefreshing(false)
  }

  const challenges = useMemo(() => {
    const challengeMap = new Map<
      string,
      { projectCount: number; participantIds: Set<string> }
    >()

    submissions.forEach((s) => {
      const participantIds = s.submission_participants.map(
        (sp) => sp.participant_id
      )
      s.prizes.forEach((prize) => {
        if (!challengeMap.has(prize)) {
          challengeMap.set(prize, {
            projectCount: 0,
            participantIds: new Set()
          })
        }
        const info = challengeMap.get(prize)!
        info.projectCount++
        participantIds.forEach((pid) => info.participantIds.add(pid))
      })
    })

    const entries = Array.from(challengeMap.entries()).map(([name, info]) => ({
      name,
      projectCount: info.projectCount,
      participantCount: info.participantIds.size
    }))

    entries.sort((a, b) => {
      if (a.name === "GENERAL") return -1
      if (b.name === "GENERAL") return 1
      return a.name.localeCompare(b.name)
    })

    return entries
  }, [submissions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="whitespace-nowrap text-sm text-muted-foreground">
          {challenges.length}{" "}
          {challenges.length === 1 ? "challenge" : "challenges"}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh challenges"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="shadow-none">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : challenges.map((challenge) => (
              <Link
                key={challenge.name}
                href={`/dashboard/challenges/${encodeURIComponent(challenge.name)}`}
              >
                <Card className="shadow-none transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <PrizeBadge prize={challenge.name} />
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <FolderOpen className="h-3.5 w-3.5" />
                          {challenge.projectCount}{" "}
                          {challenge.projectCount === 1
                            ? "project"
                            : "projects"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {challenge.participantCount}{" "}
                          {challenge.participantCount === 1
                            ? "participant"
                            : "participants"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  )
}
