import { createClient } from '@/utils/supabase/client';
import { offlineQueue, Mutation } from './offlineQueue';
import { useSyncStore } from './syncStore';

interface HabitLog {
  completed_at: string;
  habit_id: string;
}

export class SyncManager {
  private static instance: SyncManager;
  private supabase = createClient();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  static getInstance() {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Starts the background sync process.
   */
  start() {
    if (this.syncInterval) return;
    
    // Initial sync
    this.sync();

    // Check for connectivity changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync());
    }
    
    // Background interval (every 5 minutes)
    this.syncInterval = setInterval(() => {
      this.sync();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      useSyncStore.getState().setStatus('offline');
      return;
    }

    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return;

    useSyncStore.getState().setStatus('syncing');

    try {
      // 1. Process Offline Queue (Push)
      await this.processQueue();

      // 2. Refresh Local State (Pull)
      // ONLY if push was successful (processQueue didn't throw)
      await this.pull();
      
      useSyncStore.getState().setLastSyncedAt(new Date().toISOString());
      useSyncStore.getState().setStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      useSyncStore.getState().setStatus('error');
    }
  }

  /**
   * Pulls all data for the current user from Supabase and hydrates local storage.
   */
  async pull() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.user?.id) return;

    const userId = session.user.id;
    console.log('🔄 Pulling latest cloud state...');

    const modules = [
      { table: 'profiles', key: 'monk_os_profile' },
      { table: 'habits', key: 'monk_os_habits' },
      { table: 'habit_logs', key: 'monk_os_logs' },
      { table: 'journal_entries', key: 'monk_os_journal' },
      { table: 'goals', key: 'monk_os_goals' },
      { table: 'goal_milestones', key: 'monk_os_goal_milestones' },
      { table: 'focus_sessions', key: 'monk_os_focus' },
      { table: 'finances', key: 'monk_os_finance' },
      { table: 'bills', key: 'monk_os_bills' },
      { table: 'debts', key: 'monk_os_debts' },
      { table: 'tasks', key: 'monk_os_todos' },
      { table: 'ikigai_data', key: 'monk_os_ikigai' },
      { table: 'iron_will_challenges', key: 'monk_os_iron_will' },
      { table: 'iron_will_logs', key: 'monk_os_iron_will_logs' },
      { table: 'user_settings', key: 'monk_os_settings' },
      { table: 'streaks', key: 'monk_os_streak_data' },
    ];

    for (const mod of modules) {
      try {
        const idField = (mod.table === 'profiles' || mod.table === 'ikigai_data' || mod.table === 'user_settings' || mod.table === 'streaks') 
          ? 'id' 
          : 'user_id';

        const { data, error } = await this.supabase
          .from(mod.table)
          .select('*')
          .eq(idField, userId);

        if (error) {
          console.error(`Error pulling ${mod.table}:`, error.message);
          continue;
        }

        if (!data || data.length === 0) continue;

        // Special handling for different storage formats
        if (mod.table === 'habit_logs') {
          this.hydrateHabitLogs(data as unknown as HabitLog[]);
        } else if (mod.table === 'profiles' || mod.table === 'ikigai_data' || mod.table === 'user_settings' || mod.table === 'streaks') {
          localStorage.setItem(mod.key, JSON.stringify(data[0]));
          if (mod.table === 'streaks' && data[0].restart_date) {
            localStorage.setItem('monk_os_streak_restart', data[0].restart_date);
          }
        } else {
          localStorage.setItem(mod.key, JSON.stringify(data));
        }
      } catch (err) {
        console.error(`Failed to pull ${mod.table}:`, err);
      }
    }

    // Trigger a re-render across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sync_complete'));
    }
  }

  private hydrateHabitLogs(logs: HabitLog[]) {
    // Frontend expects Record<string, boolean> where key is "YYYY-MM-DD-habitId"
    const formattedLogs: Record<string, boolean> = {};
    logs.forEach(log => {
      const date = new Date(log.completed_at).toISOString().split('T')[0];
      const key = `${date}-${log.habit_id}`;
      formattedLogs[key] = true;
    });
    localStorage.setItem('monk_os_logs', JSON.stringify(formattedLogs));
  }

  private async processQueue() {
    const queue = offlineQueue.get();
    if (queue.length === 0) return;

    for (const mutation of queue) {
      try {
        await this.executeMutation(mutation);
        offlineQueue.remove(mutation.id);
        useSyncStore.getState().decrementPending();
      } catch (error) {
        console.error(`Failed to execute mutation ${mutation.id}:`, error);
        // If it's a conflict or permanent error, we might want to remove it
        // but for now we just keep it in queue to retry
        throw error; 
      }
    }
  }

  private async executeMutation(mutation: Mutation) {
    const { table, action, payload } = mutation;
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.error('Mutation aborted: No active session');
      return;
    }

    // Inject user_id into payload for data ownership (except for profiles table which uses 'id')
    const userId = session.user.id;
    const finalPayload: Record<string, unknown> = { 
      ...payload, 
      [table === 'profiles' || table === 'ikigai_data' ? 'id' : 'user_id']: userId,
      updated_at: new Date().toISOString() 
    };

    // Special case for ikigai_data which uses user_id as primary key named 'user_id' in schema but usually 'id' in local
    if (table === 'ikigai_data') {
       finalPayload.user_id = userId;
       delete finalPayload.id;
    }

    switch (action) {
      case 'INSERT':
        await this.supabase.from(table).insert(finalPayload);
        break;
      case 'UPDATE':
        await this.supabase.from(table).update(finalPayload).eq(table === 'ikigai_data' ? 'user_id' : 'id', (finalPayload.id as string) || userId);
        break;
      case 'DELETE':
        if (table === 'habit_logs') {
          await this.supabase.from(table).delete().match({ habit_id: finalPayload.habit_id, completed_at: finalPayload.completed_at });
        } else {
          await this.supabase.from(table).delete().eq('id', payload.id);
        }
        break;
      case 'UPSERT':
        if (table === 'habit_logs') {
          await this.supabase.from(table).upsert(finalPayload, { onConflict: 'habit_id,completed_at' });
        } else {
          await this.supabase.from(table).upsert(finalPayload);
        }
        break;
    }
  }

  /**
   * Helper to perform a sync-aware data save.
   */
  async save(table: string, action: Mutation['action'], payload: Record<string, unknown>) {
    // 1. Add to local queue immediately (Local First)
    offlineQueue.add({ table, action, payload });
    useSyncStore.getState().incrementPending();

    // 2. Trigger background sync attempt
    this.sync();
  }
}

export const syncManager = SyncManager.getInstance();
