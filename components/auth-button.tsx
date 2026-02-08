"use client"

import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Gavel } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const isOnDashboard = pathname.startsWith("/dashboard")

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return null
  }

  return user ? (
    <div className="flex items-center gap-2">
      {!isOnDashboard && (
        <Button asChild size="sm" variant={"default"}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Judging Area
          </Link>
        </Button>
      )}
    </div>
  ) : (
    <Button asChild size="sm" variant={"default"}>
      <Link href="/auth/login" className="flex items-center gap-2">
        <Gavel className="h-4 w-4" />
        Judging Area
      </Link>
    </Button>
  )
}
