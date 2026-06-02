import { createClient } from '@/utils/supabase/client';

export class MigrationManager {
  private supabase = createClient();

  async migrateAll(userId: string) {
    const isMigrated = localStorage.getItem('monk_os_migrated_v2');
    if (isMigrated === 'true') return;

    console.log('📦 Starting Comprehensive Legacy Migration...');

    try {
      await Promise.all([
        this.migrateHabits(userId),
        this.migrateFinances(userId),
        this.migrateFocus(userId),
        this.migrateJournal(userId),
        this.migrateIronWill(userId),
        this.migrateGoals(userId),
        this.migrateIkigai(userId),
      ]);

      localStorage.setItem('monk_os_migrated_v2', 'true');
      console.log('✅ Migration Successful.');
      // Optional: window.location.reload();
    } catch (error) {
      console.error('❌ Migration Critical Failure:', error);
    }
  }

  private async migrateHabits(userId: string) {
    const localHabits = JSON.parse(localStorage.getItem('monk_os_habits') || '[]');
    const localLogs = JSON.parse(localStorage.getItem('monk_os_logs') || '{}');

    if (localHabits.length > 0) {
      const habitsToInsert = localHabits.map((h: any) => ({
        id: h.id,
        user_id: userId,
        title: h.title,
        category: h.category,
        is_non_negotiable: h.isNonNegotiable,
      }));
      await this.supabase.from('habits').upsert(habitsToInsert);
    }

    if (Object.keys(localLogs).length > 0) {
      const logsToInsert = Object.entries(localLogs).map(([key, value]) => {
        const [date, habitId] = key.split('-');
        return {
          user_id: userId,
          habit_id: habitId,
          completed_at: new Date(date).toISOString(),
        };
      });
      await this.supabase.from('habit_logs').upsert(logsToInsert);
    }
  }

  private async migrateFinances(userId: string) {
    const localFinance = JSON.parse(localStorage.getItem('monk_os_finance') || '[]');
    const localBills = JSON.parse(localStorage.getItem('monk_os_bills') || '[]');
    const localDebts = JSON.parse(localStorage.getItem('monk_os_debts') || '[]');

    if (localFinance.length > 0) {
      const toInsert = localFinance.map((f: any) => ({
        user_id: userId,
        type: f.type,
        amount: f.amount,
        reason: f.reason,
        category: f.category,
        created_at: f.date
      }));
      await this.supabase.from('finances').upsert(toInsert);
    }

    if (localBills.length > 0) {
      const toInsert = localBills.map((b: any) => ({
        user_id: userId,
        title: b.title,
        amount: b.amount,
        due_date: b.dueDate,
        is_paid: b.isPaid,
        repeat_interval: b.repeatInterval
      }));
      await this.supabase.from('bills').upsert(toInsert);
    }

    if (localDebts.length > 0) {
      const toInsert = localDebts.map((d: any) => ({
        user_id: userId,
        person_name: d.personName,
        amount: d.amount,
        type: d.type,
        reason: d.reason,
        due_date: d.dueDate
      }));
      await this.supabase.from('debts').upsert(toInsert);
    }
  }

  private async migrateFocus(userId: string) {
    const localFocus = JSON.parse(localStorage.getItem('monk_os_focus') || '[]');
    if (localFocus.length > 0) {
      const toInsert = localFocus.map((f: any) => ({
        user_id: userId,
        mode: f.mode,
        duration_minutes: f.duration,
        completed_at: f.timestamp
      }));
      await this.supabase.from('focus_sessions').upsert(toInsert);
    }
  }

  private async migrateJournal(userId: string) {
    const localJournal = JSON.parse(localStorage.getItem('monk_os_journal') || '[]');
    if (localJournal.length > 0) {
      const toInsert = localJournal.map((j: any) => ({
        user_id: userId,
        content: j.content,
        category: j.category,
        domain: j.domain,
        created_at: j.timestamp
      }));
      await this.supabase.from('journal_entries').upsert(toInsert);
    }
  }

  private async migrateIronWill(userId: string) {
    const localIronWill = JSON.parse(localStorage.getItem('monk_os_iron_will') || '[]');
    if (localIronWill.length > 0) {
      for (const challenge of localIronWill) {
        await this.supabase.from('iron_will_challenges').upsert({
          id: challenge.id,
          user_id: userId,
          title: challenge.title,
          start_date: challenge.startDate,
          last_reset_date: challenge.lastResetDate,
          personal_best: challenge.personalBest
        });
      }
    }
  }

  private async migrateGoals(userId: string) {
    const localGoals = JSON.parse(localStorage.getItem('monk_os_goals') || '[]');
    if (localGoals.length > 0) {
      const toInsert = localGoals.map((g: any) => ({
        user_id: userId,
        title: g.title,
        status: g.completed ? 'completed' : 'pending',
        created_at: g.timestamp
      }));
      await this.supabase.from('tasks').upsert(toInsert);
    }
  }

  private async migrateIkigai(userId: string) {
    const localIkigai = JSON.parse(localStorage.getItem('monkos_ikigai_evolution') || 'null');
    if (localIkigai && localIkigai.result) {
      await this.supabase.from('ikigai_data').upsert({
        user_id: userId,
        ikigai_statement: localIkigai.result.ikigaiStatement,
        love_answers: localIkigai.dimensions?.passion?.answers || [],
        good_at_answers: localIkigai.dimensions?.skill?.answers || [],
        world_needs_answers: localIkigai.dimensions?.mission?.answers || [],
        paid_for_answers: localIkigai.dimensions?.vocation?.answers || []
      });
    }
  }
}

export const migrationManager = new MigrationManager();
