import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { DashboardNav } from "@/components/dashboard-nav"
import { SidebarUser } from "@/components/sidebar-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider
} from "@/components/ui/sidebar"
import { FastForward } from "lucide-react"

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="none" className="w-48 border-r">
          <SidebarHeader className="flex flex-row items-center justify-center gap-2 border-b p-4">
            <FastForward className="h-6 w-6" />
            <span className="text-lg font-semibold">FastTrack</span>
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <DashboardBreadcrumb />
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
