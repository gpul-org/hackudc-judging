"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, Shield, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface PendingUser {
  id: string
  email: string
  created_at: string
}

export default function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 10

  const fetchPendingUsers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .is("role", null)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch pending users")
      console.error(error)
      return
    }

    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        setCurrentUserRole(profile?.role || null)
      }
    }

    fetchCurrentUserRole()
    fetchPendingUsers()
  }, [])

  const handleAssignRole = async (userId: string, role: "judge" | "admin") => {
    console.log("Assigning role:", role, "to user:", userId)
    const supabase = createClient()

    try {
      const { error, data } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)

      console.log("Update result:", { data, error })

      if (error) throw error

      toast.success(`User assigned as ${role}`)
      fetchPendingUsers()
    } catch (error) {
      toast.error("Failed to assign role")
      console.error("Error assigning role:", error)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPendingUsers()
    setIsRefreshing(false)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
          <div className="whitespace-nowrap text-sm text-muted-foreground">
            {filteredUsers.length} pending{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh pending users"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Signed Up</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-[106px] rounded-md" />
                      <Skeleton className="h-8 w-[112px] rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No pending users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{formatDateTime(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignRole(user.id, "judge")}
                      >
                        <UserCheck className="mr-1 h-4 w-4" />
                        Make Judge
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignRole(user.id, "admin")}
                        disabled={currentUserRole === "judge"}
                      >
                        <Shield className="mr-1 h-4 w-4" />
                        Make Admin
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
