'use client'

import { useState, useCallback, useRef } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { getExpenses, addExpense } from '@/lib/storage'
import { enqueueSync, clearSyncQueue } from '@/lib/syncQueue'
import { API } from '@/lib/constants'
import type { Expense } from '@/types'

export interface NotionSyncResult {
  pulled: number
  pushed: number
}

/**
 * Bidirectional sync between IndexedDB and Notion.
 *
 * Pull: fetches all pages from the database, saves any IDs not present locally.
 * Push: sends any local IDs not found in Notion to /api/notion.
 * The ID property is the dedup key — no page is ever duplicated on either side.
 * Failed pushes are added to the notion sync queue for retry by useSyncQueue.
 */
export function useNotionSync() {
  const { config } = useConfig()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<NotionSyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const syncingRef = useRef(false)

  const sync = useCallback(async () => {
    if (syncingRef.current) return
    if (!config.notion?.databaseId || !config.notion?.encryptedToken) return

    syncingRef.current = true
    setSyncing(true)
    setError(null)
    setResult(null)

    const notionConfig = config.notion

    try {
      // 1. Fetch all pages from Notion.
      const params = new URLSearchParams({
        notionDatabaseId: notionConfig.databaseId,
        notionToken: notionConfig.encryptedToken,
      })
      const fetchRes = await fetch(`${API.NOTION}?${params}`)
      const fetchJson = (await fetchRes.json()) as {
        ok: boolean
        expenses?: Expense[]
        error?: string
      }
      if (!fetchJson.ok) throw new Error(fetchJson.error ?? 'Failed to fetch from Notion.')

      const notionExpenses = fetchJson.expenses ?? []

      // 2. Load all local expenses; compute ID sets for the diff.
      const localExpenses = await getExpenses()
      const localIds = new Set(localExpenses.map((e) => e.id))
      const notionIds = new Set(notionExpenses.map((e) => e.id))

      // 3. Pull: pages in Notion but not in local IndexedDB.
      const toPull = notionExpenses.filter((e) => !localIds.has(e.id))
      for (const expense of toPull) {
        await addExpense(expense)
      }

      // 4. Push: local expenses missing from Notion (sequential to avoid rate limits).
      const toPush = localExpenses.filter((e) => !notionIds.has(e.id))
      let pushed = 0
      for (const expense of toPush) {
        try {
          const res = await fetch(API.NOTION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...expense,
              notionDatabaseId: notionConfig.databaseId,
              notionToken: notionConfig.encryptedToken,
            }),
          })
          const json = (await res.json()) as { ok: boolean }
          if (json.ok) {
            pushed++
          } else {
            enqueueSync(expense.id, 'notion')
          }
        } catch {
          enqueueSync(expense.id, 'notion')
        }
      }

      setResult({ pulled: toPull.length, pushed })
      clearSyncQueue('notion')
      if (toPull.length > 0) window.dispatchEvent(new CustomEvent('mt:notion-pull'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed.')
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [config.notion])

  return { syncing, sync, result, error }
}
