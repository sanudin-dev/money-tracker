# Architecture

## Overview

Local-first expense tracker. All user data lives in the browser (IndexedDB + localStorage). Integrations (Zapier, Sheets API) are independent output channels — not modes. Both can be active simultaneously. Server-side API routes are thin proxies only.

---

## Data flow

1. User submits expense form (date capped at today — no future dates)
2. Expense written to **IndexedDB** — always, regardless of integrations
3. If Zapier configured → `POST /api/zapier` (appends row via webhook)
4. If Sheets API configured → `POST /api/sheets` → creates `YYYY-MM` tab if needed → appends row
5. History always reads from IndexedDB
6. CSV export scoped to the currently viewed month (from IndexedDB)
7. Offline: expense saved locally, API call queued per integration in `mt_sync_queue_zapier` / `mt_sync_queue_sheets`; auto-synced on reconnect

---

## Core types

```ts
// src/types/index.ts

export type IntegrationType = 'zapier' | 'sheets'

export interface ZapierIntegration {
  webhookUrl: string
  appId?: string     // optional; included in every Zapier payload for Filter by Zapier step
}

export interface SheetsIntegration {
  spreadsheetId: string
  refreshToken: string    // AES-256-GCM encrypted blob; decrypted server-side on each request
  connectedEmail: string  // display only
}

export interface Config {
  currencyCode: string
  zapier?: ZapierIntegration
  sheets?: SheetsIntegration
}

export interface Expense {
  id: string          // crypto.randomUUID() with Math.random fallback
  amount: number
  category: string
  description: string
  date: string        // YYYY-MM-DD
  createdAt: string   // ISO timestamp
}
```

An integration is "active" when its object is present in Config. Removing the object disables it.

---

## Sync queue

Per-integration retry queues stored in localStorage:
- `mt_sync_queue_zapier` — expense IDs that failed to push to Zapier
- `mt_sync_queue_sheets` — expense IDs that failed to push to Sheets API

Each queue is processed independently on reconnect. A retry only hits the failed integration — a prior successful push is never duplicated.

Queue helpers in `src/lib/syncQueue.ts`:
- `getSyncQueue(integration)` → `string[]`
- `enqueueSync(id, integration)` → `void`
- `dequeueSync(id, integration)` → `void`

---

## Bidirectional sync (Sheets API)

`useSheetsSync` hook (called from `HistoryClient`) enables multi-device / multi-user sync via a shared spreadsheet.

1. `GET /api/sheets` — fetches all rows from the sheet
2. Diff by `id` against IndexedDB:
   - **Pull**: rows in sheet but not locally → `addExpense()` (upsert — safe to call with existing IDs)
   - **Push**: local expenses not in sheet → `POST /api/sheets` sequentially (to respect rate limits)
3. Failed pushes are enqueued to `mt_sync_queue_sheets` for retry by `useSyncQueue`
4. `HistoryClient` reloads from IndexedDB when `pulled > 0`

The `id` field is the dedup key. No row is ever duplicated on either side.

---

## Authentication flow (Sheets API)

1. User clicks "Connect Google Sheets" in `/settings/connect`
2. `GET /api/auth/google` redirects to Google OAuth consent screen
3. User approves; Google redirects to `GET /api/auth/google/callback`
4. Callback exchanges code for tokens, fetches user email, **encrypts the refresh token** with AES-256-GCM using `ENCRYPTION_KEY`, then redirects to `/settings/connect?sheetsRefreshToken=<encrypted>&sheetsEmail=...`
5. `ConfigForm` picks up the query params and saves them to localStorage via `useConfig`
6. On every subsequent API call, the encrypted blob is sent to the server which decrypts it before use

Requires in `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY`

Generate a key: `openssl rand -base64 32`

---

## Zapier App ID

An optional `appId` string can be set in the Zapier integration config. It is included in every payload sent to the Zapier webhook. Users can add a **Filter by Zapier** step (free tier) to check this value — useful when multiple apps share the same Zap.

---

## PWA

- Service worker: `@ducanh2912/next-pwa`, disabled in development (`NODE_ENV === 'development'`)
- Manifest: `public/manifest.json` — `display: standalone`, `theme_color: #18181b`
- Icons: `public/icon-192.png`, `public/icon-512.png` (must be present for install prompt)
- Offline write: always succeeds (IndexedDB). API sync is queued per integration if offline.
