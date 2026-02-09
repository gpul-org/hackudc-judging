"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Admin {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

export function AdminDetail({ id }: { id: string }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: adminData, error: adminError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("id", id)
        .eq("role", "admin")
        .single()

      if (adminError) {
        toast.error("Failed to fetch admin")
        console.error(adminError)
        setLoading(false)
        return
      }

      setAdmin(adminData)
      window.dispatchEvent(
        new CustomEvent("breadcrumbLabel", { detail: adminData.email })
      )
      setLoading(false)
    }

    fetchData()
  }, [id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Details</h1>
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
                admin?.first_name || "—"
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
                admin?.last_name || "—"
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
                admin?.email || "—"
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
