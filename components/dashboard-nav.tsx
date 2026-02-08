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
  UserCog,
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
    title: "Pending Users",
    href: "/dashboard/pending-users",
    icon: UserCog
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
                {(index === 2 || index === 5) && (
                  <Separator className="mx-auto my-2 w-3/4" />
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={
                      isActive
                        ? "bg-secondary transition-colors duration-200"
                        : "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                    }
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
