import { AuthButton } from "@/components/auth-button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { FastForward } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <div className="flex items-center gap-2 text-xl">
                <FastForward className="h-5 w-5" />
                <span>FastTrack</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </div>
        </nav>
        <div className="flex max-w-5xl flex-1 flex-col items-center justify-center p-5">
          {/* Content goes here */}
        </div>
      </div>
    </main>
  )
}
