'use client'

import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { useSyncQueue } from '@/hooks/useSyncQueue'
import { useSheetsSync } from '@/hooks/useSheetsSync'
import { useNotionSync } from '@/hooks/useNotionSync'
import { INTEGRATION_META } from '@/components/icons'

function ErrorLine({ msg, href }: { msg: string; href?: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-red-500 dark:text-red-400">{msg}</span>
      {href && (
        <Link
          href={href}
          className="shrink-0 font-medium text-red-600 underline underline-offset-2 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Reconnect →
        </Link>
      )}
    </span>
  )
}

export function SyncBanner() {
  const { config } = useConfig()
  const { pendingCount, syncing: queueSyncing, processQueue } = useSyncQueue()
  const { syncing: sheetsSyncing, sync: syncSheets, result: sheetsResult, error: sheetsError } = useSheetsSync()
  const { syncing: notionSyncing, sync: syncNotion, result: notionResult, error: notionError } = useNotionSync()

  const sheetsConnected = !!config.sheets?.spreadsheetId && !!config.sheets?.refreshToken
  const notionConnected = !!config.notion?.databaseId && !!config.notion?.encryptedToken

  const hasIntegrations = !!(config.webhook?.webhookUrl || sheetsConnected || notionConnected)
  if (!hasIntegrations) return null

  const syncing = queueSyncing || sheetsSyncing || notionSyncing

  function handleSync() {
    void processQueue()
    if (sheetsConnected) void syncSheets()
    if (notionConnected) void syncNotion()
  }

  function syncActivity(pulled: number, pushed: number): string {
    return pulled + pushed === 0 ? 'Up to date' : `↓ ${pulled} pulled · ↑ ${pushed} pushed`
  }

  const statusLines: React.ReactNode[] = []

  if (sheetsError) {
    statusLines.push(
      <ErrorLine key="sheets-err" msg={sheetsError} href={/reconnect/i.test(sheetsError) ? '/settings/connect' : undefined} />
    )
  }
  if (notionError) {
    statusLines.push(
      <ErrorLine key="notion-err" msg={notionError} href={/reconnect/i.test(notionError) ? '/settings/connect' : undefined} />
    )
  }
  if (sheetsResult) {
    const { Icon, label } = INTEGRATION_META.sheets
    statusLines.push(
      <span key="sheets-res" className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
        {<Icon className="h-3.5 w-3.5 shrink-0" aria-label={label} />}
        {syncActivity(sheetsResult.pulled, sheetsResult.pushed)}
      </span>
    )
  }
  if (notionResult) {
    const { Icon, label } = INTEGRATION_META.notion
    statusLines.push(
      <span key="notion-res" className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
        {<Icon className="h-3.5 w-3.5 shrink-0" aria-label={label} />}
        {syncActivity(notionResult.pulled, notionResult.pushed)}
      </span>
    )
  }
  if (statusLines.length === 0 && pendingCount > 0) {
    statusLines.push(
      <span key="pending" className="text-zinc-400 dark:text-zinc-500">{pendingCount} pending</span>
    )
  }

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
      {!syncing && statusLines.length > 0 && (
        <div className="mt-1 flex flex-col gap-0.5">
          {statusLines}
        </div>
      )}
    </div>
  )
}
