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
  "/dashboard/pending-users": "Pending Users",
  "/dashboard/upload": "Upload",
  "/dashboard/participants": "Participants",
  "/dashboard/projects": "Projects",
  "/dashboard/judges": "Judges",
  "/dashboard/challenges": "Challenges",
  "/dashboard/rooms": "Rooms",
  "/dashboard/profile": "Profile"
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const currentPage = routeNames[pathname] || "Dashboard"
  const isSubPage = pathname !== "/dashboard"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {isSubPage ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
