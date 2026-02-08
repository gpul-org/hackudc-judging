"use client"

import { Separator } from "@/components/ui/separator"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import {
  DoorOpen,
  FileText,
  Gavel,
  Home,
  Trophy,
  Users,
  UsersRound
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Participants",
    href: "/dashboard/participants",
    icon: Users
  },
  {
    title: "Teams",
    href: "/dashboard/teams",
    icon: UsersRound
  },
  {
    title: "Submissions",
    href: "/dashboard/submissions",
    icon: FileText
  },
  {
    title: "Judges",
    href: "/dashboard/judges",
    icon: Gavel
  },
  {
    title: "Challenges",
    href: "/dashboard/challenges",
    icon: Trophy
  },
  {
    title: "Rooms",
    href: "/dashboard/rooms",
    icon: DoorOpen
  }
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <div key={item.href}>
                {(index === 1 || index === 4) && (
                  <Separator className="mx-auto my-2 w-3/4" />
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={isActive ? "bg-secondary" : ""}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
