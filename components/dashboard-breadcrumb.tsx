"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

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
  const [dynamicLabel, setDynamicLabel] = useState<{
    path: string
    label: string
  } | null>(null)

  useEffect(() => {
    const handleBreadcrumbUpdate = (e: CustomEvent<string>) => {
      setDynamicLabel({ path: pathname, label: e.detail })
    }

    window.addEventListener(
      "breadcrumbLabel",
      handleBreadcrumbUpdate as EventListener
    )
    return () => {
      window.removeEventListener(
        "breadcrumbLabel",
        handleBreadcrumbUpdate as EventListener
      )
    }
  }, [pathname])

  const currentLabel = useMemo(
    () => (dynamicLabel?.path === pathname ? dynamicLabel.label : null),
    [dynamicLabel, pathname]
  )

  if (pathname === "/dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const parentPath = pathname.split("/").slice(0, 3).join("/")
  const parentName = routeNames[parentPath]
  const isDirectChild = routeNames[pathname] !== undefined

  if (isDirectChild) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{routeNames[pathname]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={parentPath}>
            {parentName || "Page"}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {currentLabel || <Skeleton className="h-4 w-24" />}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
