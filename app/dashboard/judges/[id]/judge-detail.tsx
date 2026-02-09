"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Judge {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

export function JudgeDetail({ id }: { id: string }) {
  const [judge, setJudge] = useState<Judge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: judgeData, error: judgeError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("id", id)
        .eq("role", "judge")
        .single()

      if (judgeError) {
        toast.error("Failed to fetch judge")
        console.error(judgeError)
        setLoading(false)
        return
      }

      setJudge(judgeData)
      window.dispatchEvent(
        new CustomEvent("breadcrumbLabel", { detail: judgeData.email })
      )
      setLoading(false)
    }

    fetchData()
  }, [id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Judge Details</h1>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              First Name
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                judge?.first_name || "—"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Last Name
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                judge?.last_name || "—"
              )}
            </div>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between p-4">
            <Label className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
              Email
            </Label>
            <div className="flex-1 text-sm">
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                judge?.email || "—"
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
