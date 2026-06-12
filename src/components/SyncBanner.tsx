'use client'

import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { useSyncQueue } from '@/hooks/useSyncQueue'
import { useSheetsSync } from '@/hooks/useSheetsSync'

export function SyncBanner() {
  const { config } = useConfig()
  const { pendingCount, syncing: queueSyncing, processQueue } = useSyncQueue()
  const { syncing: sheetsSyncing, sync: syncSheets, result: sheetsResult, error: sheetsError } = useSheetsSync()

  const hasIntegrations = !!(config.webhook?.webhookUrl || config.sheets?.spreadsheetId)
  if (!hasIntegrations) return null

  const syncing = queueSyncing || sheetsSyncing

  function handleSync() {
    void processQueue()
    void syncSheets()
  }

  const statusMessage = !syncing && (
    sheetsResult ? (
      <span className="text-zinc-400 dark:text-zinc-500">
        {sheetsResult.pulled + sheetsResult.pushed === 0
          ? 'Up to date'
          : `↓ ${sheetsResult.pulled} pulled · ↑ ${sheetsResult.pushed} pushed`}
      </span>
    ) : sheetsError ? (
      <span className="flex items-center gap-1">
        <span className="text-red-500 dark:text-red-400">{sheetsError}</span>
        {/reconnect/i.test(sheetsError) && (
          <Link
            href="/settings/connect"
            className="shrink-0 font-medium text-red-600 underline underline-offset-2 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Reconnect →
          </Link>
        )}
      </span>
    ) : pendingCount > 0 ? (
      <span className="text-zinc-400 dark:text-zinc-500">{pendingCount} pending</span>
    ) : null
  )

  return (
    <div className="rounded-lg border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Data sync</span>
        <button
          type="button"
          disabled={syncing}
          onClick={handleSync}
          className="font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      </div>
      {statusMessage && <div className="mt-1">{statusMessage}</div>}
    </div>
  )
}
