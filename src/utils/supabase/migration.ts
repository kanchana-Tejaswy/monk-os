import { createClient } from "@/utils/supabase/client";

export async function migrateLocalDataToCloud() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const hasMigrated = localStorage.getItem("monk_os_migrated_to_cloud");
  if (hasMigrated === "true") return;

  console.log("Starting data migration to Supabase...");

  try {
    // 1. Habits
    const localHabits = JSON.parse(localStorage.getItem("monk_os_habits") || "[]");
    if (localHabits.length > 0) {
      for (const hab of localHabits) {
        await supabase.from('habits').upsert({
          id: hab.id,
          user_id: user.id,
          title: hab.title,
          category: hab.category,
          is_non_negotiable: hab.isNonNegotiable
        });
      }
    }

    // 2. Habit Logs
    const localLogs = JSON.parse(localStorage.getItem("monk_os_logs") || "{}");
    if (Object.keys(localLogs).length > 0) {
      const logsToInsert = Object.entries(localLogs).map(([key, value]) => {
        const [date, habitId] = key.split('-');
        return {
          user_id: user.id,
          habit_id: habitId,
          completed_at: new Date(date).toISOString(),
        };
      });
      if (logsToInsert.length > 0) {
        await supabase.from('habit_logs').insert(logsToInsert);
      }
    }

    // 3. Finances
    const localFinance = JSON.parse(localStorage.getItem("monk_os_finance") || "[]");
    if (localFinance.length > 0) {
      const finToInsert = localFinance.map((f: any) => ({
        user_id: user.id,
        type: f.type,
        amount: f.amount,
        reason: f.reason || 'Imported',
        category: f.category,
        created_at: f.date
      }));
      await supabase.from('finances').insert(finToInsert);
    }

    // 4. Focus Sessions
    const localFocus = JSON.parse(localStorage.getItem("monk_os_focus") || "[]");
    if (localFocus.length > 0) {
      const focusToInsert = localFocus.map((f: any) => ({
        user_id: user.id,
        mode: f.mode,
        duration_minutes: f.duration,
        completed_at: f.timestamp
      }));
      await supabase.from('focus_sessions').insert(focusToInsert);
    }

    // Mark as migrated
    localStorage.setItem("monk_os_migrated_to_cloud", "true");
    console.log("Migration complete!");
    window.location.reload(); // Reload to show new cloud data

  } catch (error) {
    console.error("Migration failed:", error);
  }
}
