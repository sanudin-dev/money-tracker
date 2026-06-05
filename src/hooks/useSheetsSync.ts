'use client'

import { useState, useCallback, useRef } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { getExpenses, addExpense } from '@/lib/storage'
import { enqueueSync } from '@/lib/syncQueue'
import { API } from '@/lib/constants'
import type { Expense } from '@/types'

export interface SheetsSyncResult {
  pulled: number
  pushed: number
}

/**
 * Bidirectional sync between IndexedDB and Google Sheets.
 *
 * Pull: fetches all rows from the sheet, saves any IDs not present locally.
 * Push: sends any local IDs not found in the sheet to /api/sheets.
 * The `id` column is the dedup key — no row is ever duplicated on either side.
 * Failed pushes are added to the sheets sync queue for retry by useSyncQueue.
 */
export function useSheetsSync() {
  const { config } = useConfig()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SheetsSyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Ref guards against concurrent calls (e.g. double-tap).
  const syncingRef = useRef(false)

  const sync = useCallback(async () => {
    if (syncingRef.current) return
    if (!config.sheets?.spreadsheetId || !config.sheets?.refreshToken) return

    syncingRef.current = true
    setSyncing(true)
    setError(null)
    setResult(null)

    // Capture config snapshot so object references stay stable through the async chain.
    const sheetsConfig = config.sheets

    try {
      // 1. Fetch all rows from the sheet.
      const params = new URLSearchParams({
        sheetsSpreadsheetId: sheetsConfig.spreadsheetId,
        sheetsRefreshToken: sheetsConfig.refreshToken,
      })
      const fetchRes = await fetch(`${API.SHEETS}?${params}`)
      const fetchJson = (await fetchRes.json()) as {
        ok: boolean
        expenses?: Expense[]
        error?: string
      }
      if (!fetchJson.ok) throw new Error(fetchJson.error ?? 'Failed to fetch from Sheets.')

      const sheetExpenses = fetchJson.expenses ?? []

      // 2. Load all local expenses once; compute ID sets for the diff.
      const localExpenses = await getExpenses()
      const localIds = new Set(localExpenses.map((e) => e.id))
      const sheetIds = new Set(sheetExpenses.map((e) => e.id))

      // 3. Pull: rows in sheet but not in local IndexedDB.
      const toPull = sheetExpenses.filter((e) => !localIds.has(e.id))
      for (const expense of toPull) {
        await addExpense(expense)
      }

      // 4. Push: local expenses missing from the sheet (sequential to respect Sheets API rate limits).
      const toPush = localExpenses.filter((e) => !sheetIds.has(e.id))
      let pushed = 0
      for (const expense of toPush) {
        try {
          const res = await fetch(API.SHEETS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...expense,
              sheetsSpreadsheetId: sheetsConfig.spreadsheetId,
              sheetsRefreshToken: sheetsConfig.refreshToken,
            }),
          })
          const json = (await res.json()) as { ok: boolean }
          if (json.ok) {
            pushed++
          } else {
            enqueueSync(expense.id, 'sheets')
          }
        } catch {
          enqueueSync(expense.id, 'sheets')
        }
      }

      setResult({ pulled: toPull.length, pushed })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed.')
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [config.sheets])

  return { syncing, sync, result, error }
}
