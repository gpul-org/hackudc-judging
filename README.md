# FasTrack 🎯

> A hackathon judging queue management system that eliminates Sunday morning chaos

FasTrack solves the notorious "Sunday morning problem" at hackathons by implementing a digital queue system inspired by butcher shops and deli counters. No more crowds, confusion, or teams waiting around unsure when judges will see their projects.

## The Problem

Every hackathon faces the same challenge on Sunday morning: dozens of teams need to present their projects to multiple judges across different challenges and rooms. Without a proper system, this creates:

- 😰 Crowds of teams waiting around judge stations
- ⏰ Confusion about when teams will be judged
- 📋 Lost submissions and missed presentations
- 😤 Frustrated participants and judges
- 🔥 Overwhelmed organizers

## The Solution

FasTrack implements a **butcher-style digital queue system** where:

1. **Teams get a queue number** - Just like at a deli counter, teams receive a digital number for each challenge they want to present to
2. **Real-time status updates** - Teams see their position in the queue and receive notifications when their turn is coming up
3. **Judges control the flow** - Judges call the next team when ready, keeping the process moving smoothly
4. **Organizers configure everything** - Set up rooms, challenges, assign judges, and monitor all queues from a central dashboard

## Features

### For Participants (Hackers) 👨‍💻👩‍💻

- 🎟️ Join queues for multiple challenges
- 📱 Real-time queue position updates
- 🔔 Notifications when it's almost your turn
- 👥 Team management (up to 4 members)
- 📊 Track submission status

### For Judges ⚖️

- 📋 View assigned challenge queues
- ➡️ Call next team when ready
- ⏭️ Skip or reschedule teams if needed
- 📝 Access team information and submissions
- 📍 Room assignment management

### For Admins/Organizers 🎪

- 🏢 Configure rooms and locations
- 🏆 Set up challenges with descriptions
- 👔 Assign judges to challenges
- 📊 Monitor all queues in real-time
- 👥 Manage participants and teams
- 📧 Send notifications to users
- 🔧 Adjust user roles

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Passwordless authentication (Email OTP)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Components:** [shadcn/ui](https://ui.shadcn.com)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Type Safety:** TypeScript (strict mode)
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account ([create one free](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/fastrack.git
   cd fastrack
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up Supabase**

   Create a `.env.local` file with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   Find these values at: https://supabase.com/dashboard/project/_/settings/api

4. **Run database migrations**

   ```bash
   pnpx supabase db push
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Time Setup

1. Sign up with your email (you'll receive an 8-digit OTP code)
2. Complete your profile with your name
3. Contact an organizer to change your role from "Hacker" to "Admin" or "Judge" if needed

## Development Commands

```bash
# Development
pnpm dev          # Start dev server on localhost:3000

# Building
pnpm build        # Production build
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint and auto-fix issues
pnpm format       # Format all files with Prettier
pnpm format:check # Check if files are formatted correctly

# Database
pnpx supabase migration new [name]  # Create new migration
pnpx supabase db push                # Push migrations to remote
pnpx supabase start                  # Start local Supabase
pnpx supabase stop                   # Stop local Supabase
```

## Project Structure

```
fastrack/
├── app/
│   ├── auth/                 # Authentication pages (login, OTP)
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── participants/     # Participant management
│   │   ├── teams/            # Team management
│   │   ├── submissions/      # Submission tracking
│   │   ├── judges/           # Judge assignment
│   │   ├── challenges/       # Challenge configuration
│   │   ├── rooms/            # Room setup
│   │   └── profile/          # User profile settings
│   └── layout.tsx            # Root layout with theme provider
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard-nav.tsx     # Sidebar navigation
│   ├── dashboard-breadcrumb.tsx
│   └── sidebar-user.tsx      # User profile in sidebar
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       ├── server.ts         # Server Supabase client
│       └── proxy.ts          # Middleware for session management
└── supabase/
    └── migrations/           # Database migrations
```

## How It Works

### Queue Flow

1. **Setup Phase (Organizers)**
   - Create challenges (e.g., "Best AI Hack", "Best Use of API")
   - Set up rooms (e.g., "Room A", "Main Hall")
   - Assign judges to challenges
   - Configure notification settings

2. **Registration Phase (Hackers)**
   - Form teams (1-4 members)
   - Submit project to challenges
   - Join queue(s) for judging
   - Receive queue number

3. **Judging Phase (Sunday Morning)**
   - Teams see their queue position in real-time
   - Judges call next team when ready
   - System sends notification to next team
   - Team presents to judge
   - Judge marks completion and calls next team

4. **Completion**
   - All teams get judged fairly
   - No crowds or confusion
   - Organized, efficient process

### User Roles

- **Hacker** (Default): Can create/join teams, submit projects, join queues
- **Judge**: Can view assigned queues, call teams, manage judging flow
- **Admin**: Full access to configure challenges, rooms, assign judges, manage users

## Database Schema

### Tables

- **profiles** - User profile information (name, role)
- **teams** - Team information and members
- **challenges** - Hackathon challenges/tracks
- **rooms** - Physical locations for judging
- **submissions** - Team project submissions to challenges
- **queues** - Queue entries for teams waiting to be judged
- **judges** - Judge assignments to challenges

All tables use Row Level Security (RLS) for data protection.

## Authentication

FasTrack uses **passwordless authentication** via email OTP:

- No passwords to remember or manage
- 8-digit codes sent to email
- Codes expire in 1 hour
- Secure session management with Supabase Auth

## Contributing

We welcome contributions! Please see [CLAUDE.md](./CLAUDE.md) for development guidelines and project conventions.

### Code Quality

All commits automatically run:

- ✅ ESLint with auto-fix
- ✅ Prettier formatting
- ✅ Import organization
- ✅ Tailwind class sorting

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import to Vercel
3. Add Supabase integration (automatically sets environment variables)
4. Deploy

### Environment Variables

Required for production:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-production-key
```

## License

MIT

## Acknowledgments

Built with:

- [Next.js](https://nextjs.org) by Vercel
- [Supabase](https://supabase.com) for backend and auth
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for styling

---

**FasTrack** - Making hackathon judging fast and fair 🚀
