"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { FileUp, Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
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

        setUserRole(profile?.role || null)
      }
      setLoading(false)
    }

    fetchUserRole()
  }, [])

  const isDisabled = userRole === "judge" || loading

  const validateFile = (f: File): boolean => {
    if (!f.name.endsWith(".csv")) {
      toast.error("Only CSV files are accepted")
      return false
    }
    return true
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDisabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (isDisabled) return

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)

    try {
      const supabase = createClient()

      // Force session refresh to get a valid JWT
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in to upload")
        setIsUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const { data, error } = await supabase.functions.invoke("import-csv", {
        body: formData
      })

      if (error) {
        toast.error(error.message || "Upload failed")
        return
      }

      toast.success(
        `Imported ${data.participants} participants, ${data.submissions} projects, and ${data.links} links`
      )
      setFile(null)
      if (inputRef.current) inputRef.current.value = ""
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload the CSV exported from DevPost to import hackathon data into the
        system.
      </p>
      <Card>
        <CardContent className="space-y-4 pt-6">
          {isDisabled && (
            <p className="text-sm text-muted-foreground">
              Only administrators can upload files
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isDisabled && inputRef.current?.click()}
              className={cn(
                "flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors",
                isDragging && "border-primary bg-accent",
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              <FileUp className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
              </div>
              <Input
                ref={inputRef}
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isDisabled}
                className="hidden"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div className="flex items-center gap-3 text-sm">
                <FileUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isDisabled || !file || isUploading}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Importing..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
