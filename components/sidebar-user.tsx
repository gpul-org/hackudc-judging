"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { LogOut, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Profile = {
  first_name: string | null
  last_name: string | null
  role: "hacker" | "judge" | "admin"
}

export function SidebarUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const fetchUserAndProfile = async () => {
      setLoading(true)
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name, role")
          .eq("id", user.id)
          .single()

        setProfile(profileData)
      }
      setLoading(false)
    }

    fetchUserAndProfile()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserAndProfile()
      }
    })

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserAndProfile()
    }

    window.addEventListener("profileUpdated", handleProfileUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("profileUpdated", handleProfileUpdate)
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user) return null

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email

  const displayRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "User"

  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        href="/dashboard/profile"
        className="flex min-w-0 max-w-[120px] flex-1 cursor-pointer flex-col gap-1 transition-opacity hover:opacity-80"
      >
        {loading ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </>
        ) : (
          <>
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {displayRole}
            </p>
          </>
        )}
      </Link>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {theme === "light" && <Sun className="h-4 w-4" />}
              {theme === "dark" && <Moon className="h-4 w-4" />}
              {theme === "system" && <Monitor className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  )
}
