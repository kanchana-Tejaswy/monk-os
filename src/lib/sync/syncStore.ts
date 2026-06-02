import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingMutations: number;
  
  // Actions
  setStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (date: string) => void;
  setPendingMutations: (count: number) => void;
  incrementPending: () => void;
  decrementPending: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      status: 'synced',
      lastSyncedAt: null,
      pendingMutations: 0,

      setStatus: (status) => set({ status }),
      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
      setPendingMutations: (pendingMutations) => set({ pendingMutations }),
      incrementPending: () => set((state) => ({ pendingMutations: state.pendingMutations + 1 })),
      decrementPending: () => set((state) => ({ pendingMutations: Math.max(0, state.pendingMutations - 1) })),
    }),
    {
      name: 'monk_os_sync_status',
    }
  )
);
