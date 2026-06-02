import { createClient } from '@/utils/supabase/client';
import { offlineQueue, Mutation } from './offlineQueue';
import { useSyncStore } from './syncStore';
import { conflictResolver } from './conflictResolver';

export class SyncManager {
  private static instance: SyncManager;
  private supabase = createClient();
  private syncInterval: any = null;

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
    window.addEventListener('online', () => this.sync());
    
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
    if (!navigator.onLine) {
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
      // This will be implemented per-module in Phase 5
      
      useSyncStore.getState().setLastSyncedAt(new Date().toISOString());
      useSyncStore.getState().setStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      useSyncStore.getState().setStatus('error');
    }
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
    const finalPayload = { 
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
        await this.supabase.from(table).update(finalPayload).eq(table === 'ikigai_data' ? 'user_id' : 'id', finalPayload.id || userId);
        break;
      case 'DELETE':
        await this.supabase.from(table).delete().eq('id', payload.id);
        break;
      case 'UPSERT':
        await this.supabase.from(table).upsert(finalPayload);
        break;
    }
  }

  /**
   * Helper to perform a sync-aware data save.
   */
  async save(table: string, action: Mutation['action'], payload: any) {
    // 1. Add to local queue immediately (Local First)
    const mutation = offlineQueue.add({ table, action, payload });
    useSyncStore.getState().incrementPending();

    // 2. Trigger background sync attempt
    this.sync();
  }
}

export const syncManager = SyncManager.getInstance();
