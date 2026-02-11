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
import { ChevronRight, Gavel, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface Judge {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

export default function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 10

  const fetchJudges = useRef(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("role", "judge")
      .order("first_name")

    if (error) {
      toast.error("Failed to fetch judges")
      console.error(error)
      return
    }

    setJudges(data || [])
    setLoading(false)
  })

  useEffect(() => {
    fetchJudges.current()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchJudges.current()
    setIsRefreshing(false)
  }

  const filteredJudges = judges.filter((j) => {
    const term = searchTerm.toLowerCase()
    return (
      j.email.toLowerCase().includes(term) ||
      (j.first_name || "").toLowerCase().includes(term) ||
      (j.last_name || "").toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(filteredJudges.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedJudges = filteredJudges.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm shadow-none"
          />
          <div className="whitespace-nowrap text-sm text-muted-foreground">
            {filteredJudges.length}{" "}
            {filteredJudges.length === 1 ? "judge" : "judges"}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh judges"
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
              <TableHead className="w-[25%] pl-6">First Name</TableHead>
              <TableHead className="w-[25%]">Last Name</TableHead>
              <TableHead className="w-[40%]">Email</TableHead>
              <TableHead className="w-[50px] text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3 pl-6">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedJudges.length === 0 ? (
              judges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-60">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <div className="rounded-full bg-muted p-3">
                        <Gavel className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">No judges yet</p>
                        <p className="text-sm text-muted-foreground">
                          Users assigned the Judge role will appear here
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No judges found
                  </TableCell>
                </TableRow>
              )
            ) : (
              paginatedJudges.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="py-3 pl-6 font-medium">
                    {j.first_name || "—"}
                  </TableCell>
                  <TableCell className="py-3">{j.last_name || "—"}</TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {j.email}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Link href={`/dashboard/judges/${j.id}`}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
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
