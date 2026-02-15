"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { Plus, UserPlus, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const prizeColors = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300"
]

function getPrizeColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return prizeColors[Math.abs(hash) % prizeColors.length]
}

interface Participant {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

interface AddProjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function AddProjectSheet({
  open,
  onOpenChange,
  onCreated
}: AddProjectSheetProps) {
  const [title, setTitle] = useState("")
  const [devpostUrl, setDevpostUrl] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [prizes, setPrizes] = useState<string[]>(["GENERAL"])
  const [prizeInput, setPrizeInput] = useState("")
  const [teamMembers, setTeamMembers] = useState<Participant[]>([])
  const [saving, setSaving] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  // Participant search
  const [memberSearch, setMemberSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Participant[]>([])

  // Create participant dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [creatingParticipant, setCreatingParticipant] = useState(false)

  const isDirty =
    title !== "" ||
    devpostUrl !== "" ||
    repoUrl !== "" ||
    demoUrl !== "" ||
    videoUrl !== "" ||
    prizes.length !== 1 ||
    prizes[0] !== "GENERAL" ||
    prizeInput !== "" ||
    teamMembers.length > 0

  const resetForm = () => {
    setTitle("")
    setDevpostUrl("")
    setRepoUrl("")
    setDemoUrl("")
    setVideoUrl("")
    setPrizes(["GENERAL"])
    setPrizeInput("")
    setTeamMembers([])
    setMemberSearch("")
    setSearchResults([])
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardDialog(true)
      return
    }
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const handleDiscard = () => {
    setShowDiscardDialog(false)
    resetForm()
    onOpenChange(false)
  }

  // Search participants
  const searchParticipants = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from("participants")
      .select("id, email, first_name, last_name")
      .or(
        `email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`
      )
      .limit(10)

    setSearchResults(data || [])
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchParticipants(memberSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [memberSearch, searchParticipants])

  const addTeamMember = (participant: Participant) => {
    if (teamMembers.some((m) => m.id === participant.id)) {
      toast.error("This participant is already on the team")
      return
    }
    if (teamMembers.length >= 4) {
      toast.error("Maximum 4 team members allowed")
      return
    }
    setTeamMembers((prev) => [...prev, participant])
    setMemberSearch("")
    setSearchResults([])
  }

  const removeTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
  }

  // Prize tag input
  const handlePrizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = prizeInput.trim().toUpperCase()
      if (value && !prizes.includes(value)) {
        setPrizes((prev) => [...prev, value])
      }
      setPrizeInput("")
    }
  }

  const removePrize = (prize: string) => {
    setPrizes((prev) => prev.filter((p) => p !== prize))
  }

  // Create new participant inline
  const handleCreateParticipant = async () => {
    const trimmedEmail = newEmail.trim()
    if (!trimmedEmail) {
      toast.error("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    setCreatingParticipant(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("participants")
      .insert({
        email: trimmedEmail,
        first_name: newFirstName.trim() || null,
        last_name: newLastName.trim() || null
      })
      .select("id, email, first_name, last_name")
      .single()
    setCreatingParticipant(false)

    if (error) {
      if (error.code === "23505") {
        toast.error("A participant with this email already exists")
      } else {
        toast.error("Failed to create participant")
      }
      return
    }

    toast.success("Participant created")
    addTeamMember(data)
    setNewEmail("")
    setNewFirstName("")
    setNewLastName("")
    setShowCreateDialog(false)
  }

  const handleSave = async () => {
    const trimmedUrl = devpostUrl.trim()
    if (!trimmedUrl) {
      toast.error("DevPost URL is required")
      return
    }
    try {
      new URL(trimmedUrl)
    } catch {
      toast.error("Please enter a valid DevPost URL")
      return
    }

    setSaving(true)
    const supabase = createClient()

    // Insert submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        title: title.trim() || null,
        devpost_url: trimmedUrl,
        repo_url: repoUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        prizes: prizes.length > 0 ? prizes : ["GENERAL"]
      })
      .select("id")
      .single()

    if (subError) {
      setSaving(false)
      if (subError.code === "23505") {
        toast.error("A project with this DevPost URL already exists")
      } else {
        toast.error("Failed to create project")
      }
      return
    }

    // Insert team members
    if (teamMembers.length > 0) {
      const { error: memberError } = await supabase
        .from("submission_participants")
        .insert(
          teamMembers.map((m) => ({
            submission_id: submission.id,
            participant_id: m.id
          }))
        )

      if (memberError) {
        setSaving(false)
        toast.error("Project created but failed to add team members")
        resetForm()
        onOpenChange(false)
        onCreated()
        return
      }
    }

    setSaving(false)
    toast.success("Project created")
    resetForm()
    onOpenChange(false)
    onCreated()
  }

  const filteredResults = searchResults.filter(
    (r) => !teamMembers.some((m) => m.id === r.id)
  )

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Add Project</SheetTitle>
            <SheetDescription>
              Create a new project submission with team members and prizes.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4 pb-4">
            {/* Project Details — two column grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="project-title">Title</Label>
                <Input
                  id="project-title"
                  placeholder="My Awesome Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="project-devpost">
                  DevPost URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project-devpost"
                  type="url"
                  placeholder="https://devpost.com/software/..."
                  value={devpostUrl}
                  onChange={(e) => setDevpostUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-repo">Repository URL</Label>
                <Input
                  id="project-repo"
                  type="url"
                  placeholder="https://github.com/..."
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-demo">Demo URL</Label>
                <Input
                  id="project-demo"
                  type="url"
                  placeholder="https://..."
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="project-video">Video URL</Label>
                <Input
                  id="project-video"
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Prizes */}
            <div className="space-y-2">
              <Label htmlFor="project-prizes">Prizes</Label>
              <div className="flex flex-wrap gap-1.5">
                {prizes.map((prize) => (
                  <Badge
                    key={prize}
                    variant="outline"
                    className={`gap-1 border-0 ${prize === "GENERAL" ? "" : "pr-1"} ${getPrizeColor(prize)}`}
                  >
                    {prize}
                    {prize !== "GENERAL" && (
                      <button
                        type="button"
                        onClick={() => removePrize(prize)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              <Input
                id="project-prizes"
                placeholder="Type a prize name and press Enter"
                value={prizeInput}
                onChange={(e) => setPrizeInput(e.target.value)}
                onKeyDown={handlePrizeKeyDown}
              />
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Team Members</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create new
                </Button>
              </div>

              {teamMembers.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {[member.first_name, member.last_name]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Input
                placeholder="Search participants by name or email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />

              {filteredResults.length > 0 && (
                <div className="rounded-md border">
                  {filteredResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                      onClick={() => addTeamMember(p)}
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {[p.first_name, p.last_name]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {p.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Participant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Participant</DialogTitle>
            <DialogDescription>
              Add a new participant and automatically add them to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-participant-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-participant-email"
                type="email"
                placeholder="participant@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-participant-first-name">First Name</Label>
              <Input
                id="new-participant-first-name"
                placeholder="John"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-participant-last-name">Last Name</Label>
              <Input
                id="new-participant-last-name"
                placeholder="Doe"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creatingParticipant}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateParticipant}
              disabled={creatingParticipant}
            >
              {creatingParticipant ? "Creating..." : "Create & Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
