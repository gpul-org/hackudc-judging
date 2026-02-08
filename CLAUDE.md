# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FasTrack is a hackathon queue management application built with Next.js 15 and Supabase. It handles judging queues for hackathon challenges where:

- Hackers team up (up to 4 people per team)
- Teams can present their projects to multiple challenges
- Three user roles: hacker, judge, and admin

The app uses passwordless authentication (email OTP), the Next.js App Router, dark mode support, and shadcn/ui design system.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Building
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint (next/core-web-vitals + TypeScript rules)
npm run lint:fix     # Run ESLint and auto-fix issues
npm run format       # Format all files with Prettier
npm run format:check # Check if files are formatted correctly
```

## Code Quality & Formatting

### Pre-commit Hooks

This project uses **Husky** and **lint-staged** to automatically lint and format code before commits:

- **Husky**: Manages git hooks
- **lint-staged**: Runs linters only on staged files
- **Prettier**: Code formatter with auto-organization

**Pre-commit hook runs:**

1. ESLint with `--fix` on staged `.ts`, `.tsx`, `.js`, `.jsx` files
2. Prettier with `--write` on all staged files
3. Commit is blocked if errors remain after auto-fix

### Prettier Configuration

Located in `.prettierrc`:

```json
{
  "semi": false,
  "trailingComma": "none",
  "singleQuote": false,
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"]
}
```

**Key formatting rules:**

- ❌ No semicolons at end of statements
- ❌ No trailing commas
- ✅ Double quotes for strings
- ✅ 2-space indentation
- ✅ 80 character line width
- ✅ Auto-organize and remove unused imports (`prettier-plugin-organize-imports`)
- ✅ Auto-sort Tailwind CSS classes (`prettier-plugin-tailwindcss`)

**Manual formatting:**

```bash
pnpm run format        # Format all files
pnpm run format:check  # Check formatting without changes
```

## Environment Setup

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Find these values at: https://supabase.com/dashboard/project/_/settings/api

**Note:** The app has a built-in guard (`hasEnvVars` in `lib/utils.ts`) that shows setup instructions when environment variables are missing.

## Architecture Overview

### Supabase Client Pattern

This app uses a **dual-client architecture** for Supabase:

1. **Browser Client** (`lib/supabase/client.ts`): Used in client components for auth actions (OTP request/verification, logout)
2. **Server Client** (`lib/supabase/server.ts`): Used in server components and API routes for session validation

**Critical:** Always create fresh clients per request - never cache or reuse globally. This supports Supabase Fluid compute and ensures proper cookie handling.

### Middleware Session Management

The middleware (`proxy.ts`) runs on every request to:

- Refresh JWT sessions automatically
- Synchronize cookies between request/response
- Redirect unauthenticated users away from `/dashboard` and other protected routes

**Protected routes pattern:**

- Public: `/`, `/auth/*`
- Protected: `/dashboard` and any other routes (except public ones)
- Middleware redirects unauthenticated users to `/auth/login`

### Authentication Flow (Passwordless OTP)

**Email OTP Flow - Single unified authentication:**

1. **Request OTP:**
   - User visits `/auth/login` (or `/auth/sign-up` which redirects to login)
   - User enters email in `LoginForm`
   - Call `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
   - Supabase sends 8-digit code to user's email
   - Form switches to OTP input view (same page)

2. **Verify OTP:**
   - User enters 8-digit code from email
   - Call `supabase.auth.verifyOtp({ email, token: otp, type: "email" })`
   - On success: session created, cookies set, profile auto-created (if new user)
   - User redirected to `/dashboard`

3. **Error Handling:**
   - Invalid/expired codes show error message
   - User can click "Use different email" to restart flow

4. **Logout:**
   - Click logout button → redirected to `/` (homepage), not auth page

**Key Points:**

- No passwords required - authentication is entirely via email OTP codes
- Same flow for both new and existing users (Supabase handles user creation automatically via `shouldCreateUser: true`)
- OTP codes are 8 digits long
- OTP codes expire in 1 hour
- Each OTP code can only be used once
- Code input only accepts digits (automatically filtered)
- Uses `autocomplete="one-time-code"` for better mobile UX

## Directory Structure

```
app/
├── auth/                    # Authentication pages (public)
│   ├── login/              # OTP authentication (email + code input)
│   ├── sign-up/            # Redirects to /auth/login (no distinction with OTP)
│   ├── confirm/route.ts    # Magic link verification callback (optional)
│   ├── check-email/        # "Check your email" page (rarely used)
│   ├── forgot-password/    # Legacy - not used with OTP auth
│   ├── update-password/    # Legacy - not used with OTP auth
│   ├── sign-up-success/    # Legacy success page
│   └── error/              # Auth error display
├── dashboard/              # Authenticated routes
│   ├── layout.tsx          # Shared layout for dashboard pages
│   └── page.tsx            # Main dashboard page
├── layout.tsx              # Root layout (ThemeProvider, global styles)
└── page.tsx                # Home/landing page

components/
├── ui/                     # Design system (shadcn/ui + Radix UI)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── auth-button.tsx         # Server component showing auth status in nav
├── login-form.tsx          # Client component for OTP login (2-step form)
├── sign-up-form.tsx        # Client component for OTP sign-up (2-step form)
├── logout-button.tsx       # Client component for sign out
├── forgot-password-form.tsx # Legacy - not used with OTP auth
├── update-password-form.tsx # Legacy - not used with OTP auth
├── theme-switcher.tsx      # Dark/light mode toggle
└── tutorial/               # Onboarding/setup instructions

lib/
├── supabase/
│   ├── client.ts           # Browser Supabase client factory
│   ├── server.ts           # Server Supabase client factory
│   └── proxy.ts            # Middleware session management logic
└── utils.ts                # cn() for classnames, hasEnvVars check

supabase/
└── config.toml             # Local Supabase development config
```

## UI/UX Patterns

### Form Layout Standards

**Horizontal Layout (Settings/Profile Forms):**

- Labels on the **left** side (min-w-[120px])
- Inputs on the **right** side (flex-1 max-w-md)
- Use separators (`<div className="border-t" />`) between each field
- Card padding: `p-4` (not p-6)
- Save button aligned to the **right** at the bottom after a separator

Example structure:

```tsx
<Card className="max-w-3xl">
  <CardContent className="p-0">
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between p-4">
        <Label htmlFor="field" className="min-w-[120px] text-sm font-medium">
          Field Name
        </Label>
        <div className="max-w-md flex-1">
          <Input id="field" {...props} />
        </div>
      </div>

      <div className="border-t" />

      {/* Repeat for each field */}

      <div className="border-t" />

      <div className="flex justify-end p-4">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  </CardContent>
</Card>
```

### Toast Notifications

**Always use Sonner for toast notifications:**

```bash
pnpm add sonner
```

**Setup in layout:**

```tsx
import { Toaster } from "sonner"

export default function Layout({ children }) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  )
}
```

**Usage:**

```tsx
import { toast } from "sonner"

// Success
toast.success("Profile updated successfully.")

// Error
toast.error("Failed to update profile. Please try again.")
```

**Position:** Always use `position="top-right"`

### Tooltips for Help Text

**Use HelpCircle icon for contextual help:**

```tsx
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

// Wrap form in TooltipProvider
;<TooltipProvider>
  <form>
    <div className="flex items-center gap-2">
      <Label htmlFor="field">Field Name</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Your helpful description here</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </form>
</TooltipProvider>
```

**Icon size:** Always use `h-3.5 w-3.5` for help icons

### Component Communication

**Use custom events for cross-component updates:**

When updating data that needs to reflect in other components (e.g., profile updates affecting sidebar):

```tsx
// After successful update
window.dispatchEvent(new CustomEvent("profileUpdated"))

// In listening component (useEffect)
const handleProfileUpdate = () => {
  fetchUserAndProfile()
}

window.addEventListener("profileUpdated", handleProfileUpdate)

// Cleanup
return () => {
  window.removeEventListener("profileUpdated", handleProfileUpdate)
}
```

**Common events:**

- `profileUpdated` - Triggers sidebar to refetch user profile

### Loading States

**Avoid layout shift during loading:**

- Use disabled inputs instead of skeleton components where possible
- Show actual form structure with empty/disabled states
- Maintain exact dimensions (borders, padding) during loading

```tsx
// Good - no layout shift
;<Input value={loading ? "" : data} disabled={loading} />

// Avoid - causes layout shift
{
  loading ? <Skeleton className="h-10" /> : <Input value={data} />
}
```

## Key Patterns & Conventions

### OTP Form Pattern

Both `LoginForm` and `SignUpForm` use a 2-step inline form pattern:

```typescript
const [email, setEmail] = useState("")
const [otp, setOtp] = useState("")
const [otpSent, setOtpSent] = useState(false)

// Step 1: Send OTP
const handleSendOtp = async (e) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  })
  if (!error) setOtpSent(true)
}

// Step 2: Verify OTP
const handleVerifyOtp = async (e) => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email"
  })
  if (!error) router.push("/dashboard")
}

// Conditional rendering based on otpSent state
```

### Server vs Client Components

**Use Server Components (default) for:**

- Layout wrappers
- Static content
- Reading auth state
- Database queries
- Example: `AuthButton`, `app/dashboard/page.tsx`

**Use Client Components (`"use client"`) for:**

- Forms with user input
- Interactive UI (buttons with onClick)
- React hooks (useState, useRouter)
- Example: All form components, `LogoutButton`, `ThemeSwitcher`

### Styling with Tailwind

All components use Tailwind CSS via the `cn()` utility:

```typescript
import { cn } from "@/lib/utils";

// Merges classes, handles conflicts correctly
<div className={cn("text-red-500", someCondition && "text-blue-500")} />
```

### Adding shadcn/ui Components

**IMPORTANT: Always use shadcn/ui components for UI elements. Never create custom components when a shadcn component exists.**

```bash
pnpx shadcn@latest add [component-name]
```

When adding new UI features:

1. First check if shadcn/ui has a component for it
2. Install it using the CLI command above (always use `pnpx`, not `npx`)
3. Use the installed component

This project uses the default shadcn/ui style. If you need to change styles, delete `components.json` and re-run `pnpx shadcn@latest init`.

### Import Aliases

TypeScript path alias configured: `@/*` maps to project root

```typescript
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
```

## Working with Supabase

### Local Development

Start local Supabase instance:

```bash
npx supabase start  # Starts local PostgreSQL, Auth, API
npx supabase stop   # Stops services
```

Local services (from `supabase/config.toml`):

- API: http://localhost:54321
- Studio (UI): http://localhost:54323
- PostgreSQL: localhost:54322
- Email testing: http://localhost:54324 (Inbucket)

### Database Queries

Always use the appropriate client:

```typescript
// In server components or API routes
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('table_name')
    .select()
    .eq('column', value);

  return <div>{/* render data */}</div>;
}

// In client components
import { createClient } from "@/lib/supabase/client";

export function MyComponent() {
  const supabase = createClient();
  // Use in event handlers or useEffect
}
```

## TypeScript Configuration

- **Strict mode enabled** - all type errors must be resolved
- **Target:** ES2017
- **JSX:** react-jsx (automatic runtime)
- **Module resolution:** bundler
- Path alias `@/*` configured for absolute imports

## Common Pitfalls

1. **Don't cache Supabase clients** - Always call `createClient()` fresh per request
2. **Server components can't set cookies directly** - Use middleware for session updates
3. **Client components need `"use client"` directive** - Required for hooks and interactivity
4. **Protected routes must check auth** - Middleware handles redirects, but server components should verify user
5. **OTP codes expire** - Codes are valid for 1 hour and can only be used once
6. **Email delivery required** - Users must receive email to get OTP code
7. **Input validation** - OTP input automatically filters non-digits (`replace(/\D/g, "")`)

## Adding New Protected Routes

1. Create page under `app/dashboard/[your-route]/page.tsx`
2. Middleware automatically protects it (redirects if unauthenticated)
3. Access user in server component:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <div>Protected content for {user.email}</div>;
}
```

## Database Schema

### Profiles Table

The `profiles` table stores user profile information linked to Supabase Auth:

**Schema:**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'hacker',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**User Roles (Enum):**

- `hacker` - Default role for participants
- `judge` - Evaluates team projects
- `admin` - Administrative access

**Row Level Security:**

- ✅ Everyone can read all profiles (`SELECT`)
- ✅ Users can only insert/update/delete their own profile
- ✅ Auto-creates profile with role='hacker' on user signup (via trigger)

**Accessing Profile Data:**

```typescript
// Get current user's profile
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single()

// Get all profiles (allowed by RLS)
const { data: profiles } = await supabase.from("profiles").select("*")

// Update own profile
const { error } = await supabase
  .from("profiles")
  .update({ first_name: "John", last_name: "Doe" })
  .eq("id", user.id)
```

### Creating New Migrations

1. Create migration: `pnpx supabase migration new [name]`
2. Write SQL in `supabase/migrations/[timestamp]_[name].sql`
3. Apply to production: `pnpx supabase db push`
4. Confirm when prompted

## Deployment

This app is designed for Vercel deployment with Supabase integration:

1. Push to GitHub
2. Import to Vercel
3. Add Supabase integration - automatically sets environment variables
4. Deploy

Environment variables are automatically configured when using Vercel's Supabase integration.

## Testing OTP Locally

When running Supabase locally, check Inbucket for OTP emails:

1. Start Supabase: `npx supabase start`
2. Navigate to http://localhost:54324
3. Find OTP code in sent emails
4. Enter code in the app's OTP input field
