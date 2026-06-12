import { syncQueueKey } from '@/lib/constants'
import type { IntegrationType } from '@/types'

// The queue stores expense IDs, not expense data.
// Full expense objects are resolved from IndexedDB at sync time so edits made while
// offline are reflected in the payload that eventually reaches the API.
// Each integration has its own queue so a retry only hits the failed integration —
// a successful push is never duplicated.

/** Returns the pending expense IDs for the given integration. */
export function getSyncQueue(integration: IntegrationType): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(syncQueueKey(integration)) ?? '[]') as string[]
  } catch {
    return []
  }
}

/** Adds an expense ID to the retry queue for the given integration (no-op if already present). */
export function enqueueSync(id: string, integration: IntegrationType): void {
  const q = getSyncQueue(integration)
  if (!q.includes(id)) {
    localStorage.setItem(syncQueueKey(integration), JSON.stringify([...q, id]))
  }
}

/** Removes an expense ID from the retry queue for the given integration after a successful push. */
export function dequeueSync(id: string, integration: IntegrationType): void {
  const q = getSyncQueue(integration).filter((i) => i !== id)
  localStorage.setItem(syncQueueKey(integration), JSON.stringify(q))
}

/** Clears all pending IDs for the given integration (e.g. on disconnect or after a full bidirectional sync). */
export function clearSyncQueue(integration: IntegrationType): void {
  localStorage.setItem(syncQueueKey(integration), JSON.stringify([]))
}
