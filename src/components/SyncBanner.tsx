'use client'

import { useSyncQueue } from '@/hooks/useSyncQueue'

export function SyncBanner() {
  const { pendingCount, syncing, processQueue } = useSyncQueue()

  if (pendingCount === 0) return null

  return (
    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
      <span className="text-xs text-amber-700 dark:text-amber-400">
        {syncing
          ? 'Syncing…'
          : `${pendingCount} expense${pendingCount === 1 ? '' : 's'} saved offline — waiting to sync`}
      </span>
      {!syncing && (
        <button
          type="button"
          onClick={() => void processQueue()}
          className="ml-3 shrink-0 text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Sync now
        </button>
      )}
    </div>
  )
}
