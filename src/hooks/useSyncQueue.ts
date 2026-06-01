'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSyncQueue, dequeueSync } from '@/lib/syncQueue'
import { getExpenseById } from '@/lib/storage'
import { useConfig } from '@/hooks/useConfig'
import { API } from '@/lib/constants'

/**
 * Manages per-integration offline sync queues.
 *
 * On mount and on 'online' events, walks through pending expense IDs for each
 * active integration and re-sends them to the appropriate API endpoint.
 * Each integration's queue is processed independently so a retry only hits the
 * failed integration — a prior successful push is never duplicated.
 *
 * Returns:
 *   pendingCount — total expenses waiting to sync across all integrations
 *   syncing      — true while a sync pass is in progress
 *   processQueue — call manually to trigger a sync (e.g. from SyncBanner button)
 */
export function useSyncQueue() {
  const { config } = useConfig()
  const [pendingCount, setPendingCount] = useState(
    () => getSyncQueue('zapier').length + getSyncQueue('sheets').length
  )
  const [syncing, setSyncing] = useState(false)
  // syncingRef guards against concurrent processQueue calls (e.g. rapid 'online' events).
  // syncing state drives the UI spinner; ref is checked synchronously before any await.
  const syncingRef = useRef(false)

  const refresh = useCallback(() => {
    setPendingCount(getSyncQueue('zapier').length + getSyncQueue('sheets').length)
  }, [])

  const processQueue = useCallback(async () => {
    if (syncingRef.current) return

    const zapierPending = config.zapier?.webhookUrl ? getSyncQueue('zapier').length : 0
    const sheetsPending = (config.sheets?.spreadsheetId && config.sheets?.refreshToken)
      ? getSyncQueue('sheets').length
      : 0
    if (zapierPending + sheetsPending === 0) return

    syncingRef.current = true
    setSyncing(true)

    const processZapierQueue = async () => {
      if (!config.zapier?.webhookUrl) return
      const zapierConfig = config.zapier
      for (const id of getSyncQueue('zapier')) {
        try {
          const expense = await getExpenseById(id)
          if (!expense) { dequeueSync(id, 'zapier'); continue }
          const res = await fetch(API.ZAPIER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...expense, zapierWebhookUrl: zapierConfig.webhookUrl, appId: zapierConfig.appId }),
          })
          const json = (await res.json()) as { ok: boolean }
          if (json.ok) dequeueSync(id, 'zapier')
        } catch {
          // Network error — leave remaining items in queue and stop.
          break
        }
      }
    }

    const processSheetsQueue = async () => {
      if (!config.sheets?.spreadsheetId || !config.sheets?.refreshToken) return
      const sheetsConfig = config.sheets
      for (const id of getSyncQueue('sheets')) {
        try {
          const expense = await getExpenseById(id)
          if (!expense) { dequeueSync(id, 'sheets'); continue }
          const res = await fetch(API.SHEETS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...expense, sheetsSpreadsheetId: sheetsConfig.spreadsheetId, sheetsRefreshToken: sheetsConfig.refreshToken }),
          })
          const json = (await res.json()) as { ok: boolean }
          if (json.ok) dequeueSync(id, 'sheets')
        } catch {
          break
        }
      }
    }

    await Promise.allSettled([processZapierQueue(), processSheetsQueue()])

    syncingRef.current = false
    setSyncing(false)
    refresh()
  }, [config, refresh])

  useEffect(() => {
    if (navigator.onLine) queueMicrotask(() => void processQueue())

    window.addEventListener('online', processQueue)
    return () => window.removeEventListener('online', processQueue)
  }, [processQueue, refresh])

  return { pendingCount, syncing, processQueue }
}
