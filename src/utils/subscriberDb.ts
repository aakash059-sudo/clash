export interface DropSubscriber {
  email: string;
  subscribedAt: string;
  channel: 'Viral Drop Alerts';
}

const DB_NAME = 'swaad_swag_local_db';
const DB_VERSION = 1;
const STORE_NAME = 'drop_subscribers';
const FALLBACK_STORAGE_KEY = 'swaad_swag_subscribers_v1';

function openSubscriberDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open database'));
  });
}

function readFallbackList(): DropSubscriber[] {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFallbackList(list: DropSubscriber[]) {
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

export async function getSubscribersCount(): Promise<number> {
  try {
    const db = await openSubscriberDb();
    return await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => reject(countReq.error);
    });
  } catch {
    return readFallbackList().length;
  }
}

export async function saveDropSubscriber(
  rawEmail: string
): Promise<{ status: 'subscribed' | 'already_subscribed'; subscriber: DropSubscriber; totalCount: number }> {
  const email = rawEmail.trim().toLowerCase();
  const record: DropSubscriber = {
    email,
    subscribedAt: new Date().toISOString(),
    channel: 'Viral Drop Alerts',
  };

  try {
    const db = await openSubscriberDb();
    const result = await new Promise<{
      status: 'subscribed' | 'already_subscribed';
      subscriber: DropSubscriber;
      totalCount: number;
    }>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const existingReq = store.get(email);

      existingReq.onsuccess = () => {
        const existing = existingReq.result as DropSubscriber | undefined;
        if (existing) {
          const countReq = store.count();
          countReq.onsuccess = () =>
            resolve({
              status: 'already_subscribed',
              subscriber: existing,
              totalCount: countReq.result,
            });
          return;
        }

        const addReq = store.put(record);
        addReq.onsuccess = () => {
          const countReq = store.count();
          countReq.onsuccess = () =>
            resolve({
              status: 'subscribed',
              subscriber: record,
              totalCount: countReq.result,
            });
        };
      };

      tx.onerror = () => reject(tx.error ?? new Error('Transaction failed'));
    });

    // Mirror into fallback storage for easy inspection across tabs
    const fallback = readFallbackList();
    if (!fallback.some((entry) => entry.email === email)) {
      writeFallbackList([...fallback, record]);
    }

    return result;
  } catch {
    const fallback = readFallbackList();
    const existing = fallback.find((entry) => entry.email === email);
    if (existing) {
      return {
        status: 'already_subscribed',
        subscriber: existing,
        totalCount: fallback.length,
      };
    }
    const updated = [...fallback, record];
    writeFallbackList(updated);
    return {
      status: 'subscribed',
      subscriber: record,
      totalCount: updated.length,
    };
  }
}
