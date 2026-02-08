"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/participants": "Participants",
  "/dashboard/teams": "Teams",
  "/dashboard/submissions": "Submissions",
  "/dashboard/judges": "Judges",
  "/dashboard/challenges": "Challenges",
  "/dashboard/rooms": "Rooms",
  "/dashboard/profile": "Profile"
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const currentPage = routeNames[pathname] || "Dashboard"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">FasTrack</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
