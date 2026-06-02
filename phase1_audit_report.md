# Phase 1: Dashboard & Analytics Audit Report

## 1. Connected vs. Unconnected Modules

### Currently Connected to Dashboard:
*   **Habits & Logs:** Feeds into current streak, non-negotiables list, and today's completion rate.
*   **Focus (Deep Work):** Feeds into today's deep work hours.
*   **Finance:** Feeds into total balance, monthly spent, and monthly earned.
*   **Iron Will:** Feeds into active shields and days since last reset.
*   **Ikigai:** Feeds into the purpose statement display.
*   **Goals:** Feeds into the active visions list.

### Unconnected / Underutilized Modules:
*   **Todos (Tasks):** Not displayed on the dashboard at all (missing daily priorities).
*   **Journal:** Missing entirely from both dashboard and analytics (missing reflection count, last summary).
*   **Streaks (Extended Data):** Longest streak and historical consistency are not utilized.
*   **User Settings:** Not utilized for personalized greetings or targeted insights.

## 2. Dashboard Widget Gaps (Incomplete Logic)

*   **Discipline Widget:** Lacks "Longest streak" and "Weekly consistency".
*   **Focus Widget:** Lacks "Deep work hours this week" and "Average focus session".
*   **Purpose (Ikigai) Widget:** Shows the statement but lacks "Clarity Score" and "Alignment Score".
*   **Execution Widget:** Shows individual goals but lacks "Overall Goal completion %" and "Today's Priority Tasks".
*   **Journal Widget:** Non-existent. Needs to show "Reflection count this week" and "Last reflection summary".
*   **Finance Widget:** Lacks "Monthly savings rate" (only shows raw numbers) and "Financial status" label.
*   **Iron Will Widget:** Shows active shields but lacks "Longest active shield" and "Recovery score".

## 3. Analytics Weaknesses

*   **Calculations are one-dimensional:** It aggregates scores (Discipline, Focus, Wealth) but fails to cross-reference them.
*   **No Textual Insights:** The page only outputs static strings (e.g., "ELITE", "SHARP") based on simple thresholds. It does not act as a "personal life strategist" generating sentences like *"You are 84% aligned with your stated purpose."*
*   **No Behavioral Correlation:** Missing analysis such as *"Deep work sessions are strongly correlated with habit completion"* or *"You miss habits mostly on weekends."*
*   **No Predictive Trajectories:** Missing estimations like *"Current trajectory projects goal completion in 42 days."*

## 4. Architecture & Performance Issues Found

*   **Re-render Risks:** The dashboard and analytics calculate heavy metrics (like reducing transactions and mapping arrays) directly inside the component body or `calculateFromData` functions without aggressive memoization.
*   **Data Silos:** The `Life Score` is currently calculated independently in both `dashboard` and `analytics`, leading to potential discrepancies. Phase 4 will centralize this.
*   **Empty States:** If a user has no data, the UI often shows "0" or empty lists rather than intelligent guidance (Phase 6).

---

## Exact Implementation Plan

### Step 1: Execute Phase 4 (Life Score 2.0 Centralization)
Create a centralized `lib/lifeScore.ts` utility to ensure Dashboard and Analytics calculate the exact same scores using the new weightings: Discipline (30%), Focus (25%), Purpose (20%), Execution (15%), Finance (10%).

### Step 2: Execute Phase 2 (Dashboard Transformation)
Refactor `src/app/(dashboard)/dashboard/page.tsx`:
*   Add `monk_os_todos` and `monk_os_journal` to the initialization fetch.
*   Expand the UI to include the new required metrics (Longest streak, weekly focus, clarity score, task execution, reflection summary).

### Step 3: Execute Phase 3 (Analytics Transformation)
Refactor `src/app/(dashboard)/analytics/page.tsx`:
*   Implement a new `InsightGenerator` function that analyzes local data to produce dynamic, text-based insights.
*   Calculate correlations (e.g., weekend vs. weekday habit completion, morning vs. evening focus).

### Step 4: Execute Phase 5 & 6 (Connections & Empty States)
*   Ensure every module's "save" action triggers the `sync_complete` or specific custom events so the dashboard auto-refreshes.
*   Implement intelligent empty states with actionable guidance ("No deep work sessions yet. Start your first focus session...").

### Step 5: Execute Phase 7 (Performance)
*   Wrap heavy calculations in `useMemo`.
*   Ensure all hooks follow offline-first fallback mechanisms.

Awaiting your approval to begin implementing Phase 2 and 4.