# 🧘 monk mode | Technical Manifesto & Architecture Manual

**Version:** 0.1.0  
**Framework:** Next.js 15+ (App Router)  
**Philosophy:** Peace is the Ultimate Productivity.

---

## 📖 1. Executive Summary
**monk mode** is not a "productivity app." It is a **Self-Mastery System** designed to transition users from a state of "Scattered Input" to "Focused Output." The system is built around the concept of a **Digital Ashram**—a space where environment design makes discipline the path of least resistance.

### The Prime Directive (For AI & Developers)
> **"Do not allow the user to lie to themselves."**  
> All features must adhere to the **48-Hour Integrity Rule**: Once a habit log or journal entry is older than 48 hours, it is immutable (locked). There is no "back-filling" history.

---

## 📂 2. Exhaustive Folder & File Directory

### 📁 Root Directory
- **`package.json`**: The heartbeat of the project. Note the use of **Next.js 16.2 (Canary/Latest)** and **Tailwind CSS 4**. This project uses cutting-edge React 19 features (Server Actions, Suspense).
- **`next.config.mjs`**: Configured with PWA support (via `next-pwa`) to allow the Ashram to be "installed" on mobile devices.
- **`tailwind.config.mjs` / `postcss.config.mjs`**: Integration for Tailwind 4's CSS-first engine.
- **`tsconfig.json`**: Defines path aliases (e.g., `@/*` maps to `src/*`).

---

### 📁 `src/app/` (The Routing Engine)
This directory uses the **Next.js App Router** with Route Groups for organizational clarity.

#### 🗂 `(auth)/` & `login/`
- **Purpose**: Handles user entry.
- **Logic**: Uses Supabase OAuth (Google) for frictionless onboarding. 
- **Files**: `login/page.tsx` is the primary entry gate.

#### 🗂 `(dashboard)/`
- **Purpose**: The protected "Internal Ashram." All routes here require a valid Supabase session.
- **`layout.tsx`**: The Persistent Shell. It renders the `Sidebar` and manages the responsive layout for all dashboard sub-pages.
- **`dashboard/page.tsx`**: The "Zen Hub." Aggregates data from all domains (Focus, Finance, Habits).
- **`focus/page.tsx`**: Implementation of the Pomodoro/Deep Work system.
- **`habits/page.tsx`**: The core of the system. Enforces the 48-hour lock logic.
- **`finance/page.tsx`**: Conscious spending logs—the "Financial Discipline" domain.
- **`journal/page.tsx`**: Daily reflection and mood tracking.

#### 🗂 `api/auth/callback/`
- **`route.ts`**: The server-side handler for OAuth redirects. It exchanges the code for a session and sets the appropriate cookies.

---

### 📁 `src/components/` (The Building Blocks)
- **`ui/`**: Atomic components (Buttons, Inputs, Cards). Follows the "monk-card" aesthetic—soft borders, high-quality shadows, and Lucide icons.
- **`shared/Sidebar.tsx`**: The navigation spine. It must dynamically highlight the active Domain.
- **`dashboard/`, `habits/`, etc.**: Feature-specific components. These are kept close to their domain logic to prevent "prop-drilling."

---

### 📁 `src/utils/supabase/` (The Data Bridge)
This is the most critical technical directory. It implements the **Supabase SSR** pattern.

- **`client.ts`**: Used for Client Components. Use this for `onClick` handlers or `useEffect` hooks.
- **`server.ts`**: Used for Server Components, Server Actions, and Metadata. It has access to secure cookies.
- **`middleware.ts`**: The gatekeeper. It intercepts every request to:
    1. Refresh expired sessions.
    2. Redirect unauthenticated users to `/login`.
    3. Redirect authenticated users away from `/login` to `/dashboard`.

---

### 📁 `src/lib/` (Core Logic)
- **`utils.ts`**: Contains the `cn()` (classNames) helper, which merges Tailwind classes safely using `tailwind-merge` and `clsx`.
- **`streak.ts`**: The algorithm for calculating "Real Streaks" based on the 48-Hour Integrity Rule.

---

### 📁 `supabase/`
- **`schema.sql`**: The blueprint for the PostgreSQL database. It defines the tables for `habits`, `logs`, `profiles`, and `finance`.

---

## 🧠 3. Logic Mandates for AI Models

### I. The "Ashram" Design System
- **Typography**: 
    - `font-heading` (Poppins): Used for headers and primary labels.
    - `font-soft` (Nunito): Used for body text and descriptions.
- **Colors**:
    - `primary` (#F6C1CC - Monk Rose): Used for growth and action.
    - `monk-mint`: Used for completed states and "Verified" status.
    - `background` (#FFF8FA): A soft off-white to reduce eye strain.

### II. Component Constraints
- **Client vs. Server**: If a component needs interactivity (buttons, state), add `"use client"` at the top. If it only fetches data, keep it as a Server Component for performance.
- **Animations**: Use `framer-motion` for all transitions. Movements should be "gentle" (spring physics), never jarring.

### III. Security & Middleware
- **Never bypass `updateSession`**: This function in the middleware is the only way to ensure user sessions don't expire while they are using the app.
- **Protected Routes**: Any new folder added to `src/app/(dashboard)` is automatically protected by the middleware regex matcher.

---

## 📈 4. Database Relations (AI Understanding)
- Every record in `habits`, `journal_entries`, and `finance_logs` **MUST** have a `user_id` linked to `auth.users`.
- Row Level Security (RLS) is enabled on Supabase to ensure users can only see their own data.

---

## 🛠 5. How to Modify This Project
1. **To add a feature**: Create the route in `src/app/(dashboard)/`, add the icon to `Sidebar.tsx`, and define the SQL schema in `supabase/schema.sql`.
2. **To change styles**: Edit `src/app/globals.css` or use Tailwind classes.
3. **To update Auth**: Modify `src/utils/supabase/middleware.ts`.

---

**FINAL NOTE**: The project is designed for **Deep Work**. Do not add "noisy" features like notifications, badges, or gamification that distract the user. The only reward is the user's own evolution.
