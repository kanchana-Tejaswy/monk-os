export interface Mutation {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';
  payload: Record<string, unknown>;
  timestamp: string;
}

const QUEUE_KEY = 'monk_os_offline_queue';

export const offlineQueue = {
  get: (): Mutation[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  },

  add: (mutation: Omit<Mutation, 'id' | 'timestamp'>) => {
    const queue = offlineQueue.get();
    const newMutation: Mutation = {
      ...mutation,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    queue.push(newMutation);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return newMutation;
  },

  remove: (id: string) => {
    const queue = offlineQueue.get();
    const filtered = queue.filter((m) => m.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  },

  clear: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  size: () => {
    return offlineQueue.get().length;
  }
};
