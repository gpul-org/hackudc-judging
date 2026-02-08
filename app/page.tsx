import { AuthButton } from "@/components/auth-button"
import { EnvVarWarning } from "@/components/env-var-warning"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { hasEnvVars } from "@/lib/utils"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <span className="text-xl">FasTrack</span>
            </div>
            <div className="flex items-center gap-4">
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              <ThemeSwitcher />
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
