# Money Tracker — Claude Code Project Context

## What this project is

A local-first Next.js PWA for tracking personal expenses. All data lives on-device (IndexedDB). Integrations (Webhook, Sheets API) are independent output channels — both can be active simultaneously, pushing every new expense to all configured destinations. No backend database.

---

## Tech stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **PWA**: `@ducanh2912/next-pwa` (maintained fork of `next-pwa`)
- **Validation**: `zod`
- **Storage**: `idb` for expenses (IndexedDB); config stays in `localStorage`
- **No backend / no database** — credentials live in `localStorage`, server-side secrets in `.env.local` only

---

## Folder structure

```
src/
  app/
    page.tsx                        # Home — expense history list
    add/page.tsx                    # Expense entry form
    compare/page.tsx                # Integrations — webhook vs Sheets API comparison
    install/page.tsx                # PWA install guide (Android / iOS / Desktop)
    dev/page.tsx                    # Developer notes — technical comparison + setup
    privacy/page.tsx                # Privacy policy
    settings/
      page.tsx                      # Settings hub
      connect/page.tsx              # API credentials form
      guide/page.tsx                # Step-by-step setup guide
    api/
      sheets/route.ts               # Server-side proxy for Sheets API calls
      webhook/route.ts              # Server-side proxy to forward to webhook URL
      auth/google/route.ts          # Redirects to Google OAuth consent
      auth/google/callback/route.ts # Exchanges code for tokens, stores via redirect
  components/
    ExpenseForm.tsx                 # Add expense form (renders SyncBanner above)
    HistoryClient.tsx               # Expense list, month nav, edit/delete
    HistoryWrapper.tsx              # Thin wrapper that mounts HistoryClient
    EditExpenseModal.tsx            # Edit expense modal (centered on all screen sizes)
    SyncBanner.tsx                  # Offline sync queue status banner
    ConfigForm.tsx                  # Independent Webhook + Sheets API credential panels
    IntegrationRow.tsx              # Active integrations status row (Settings page)
    CurrencyRow.tsx                 # Currency selector row (Settings page)
    ModeStatusLine.tsx              # Exports IntegrationStatusLine — active integrations + manage link
    BottomNav.tsx                   # Mobile bottom tab navigation
    SetupTabs.tsx                   # Webhook / Sheets setup guide with checklist
    Providers.tsx                   # Wraps ConfigProvider
  lib/
    storage.ts                      # IndexedDB (expenses) + localStorage (config)
    syncQueue.ts                    # enqueueSync / dequeueSync / getSyncQueue (per IntegrationType)
    categories.ts                   # Shared CATEGORIES array (20 categories)
    math.ts                         # evaluateAmount() — supports expressions like 12+8
    currency.ts                     # formatCurrency, getCurrencySymbol, etc.
    sheets.ts                       # Google Sheets API calls
    schema.ts                       # Zod schemas for expense + config
    export.ts                       # CSV export logic
    constants.ts                    # API paths, localStorage keys, integration labels, syncQueueKey()
  hooks/
    useConfig.ts                    # Read/write config from localStorage
    useSyncQueue.ts                 # Per-integration offline queues: pendingCount, syncing, processQueue
  types/
    index.ts                        # IntegrationType, Config, WebhookIntegration, SheetsIntegration, Expense types
public/
  manifest.json
  icon-192.png
  icon-512.png
```

---

## Core types

```ts
// src/types/index.ts

export type IntegrationType = 'webhook' | 'sheets'

export interface WebhookIntegration {
  webhookUrl: string
  appId?: string // optional; forwarded in every payload for filter steps
}

export interface SheetsIntegration {
  spreadsheetId: string
  refreshToken: string // AES-256-GCM encrypted blob
  connectedEmail: string // display only
}

export interface Config {
  currencyCode: string
  webhook?: WebhookIntegration // present = active
  sheets?: SheetsIntegration // present = active
}

export interface Expense {
  id: string // crypto.randomUUID() with Math.random fallback for non-HTTPS
  amount: number
  category: string
  description: string
  date: string // YYYY-MM-DD
  createdAt: string // ISO timestamp
}
```

---

## How the app works

### Local-first data flow

1. Expense always saved to IndexedDB — before any API call
2. History always reads from IndexedDB
3. CSV export always available (from IndexedDB)

### Integrations (output channels)

Integrations are independent. Both can be active simultaneously.

- **Webhook**: `POST /api/webhook` with `{ ...expense, webhookUrl, appId? }` — automation platform handles the row
- **Sheets API**: `POST /api/sheets` with `{ ...expense, sheetsSpreadsheetId, sheetsRefreshToken }` — direct Google Sheets write

### Offline handling

- If offline when submitting, the expense ID is queued per integration:
  - `mt_sync_queue_webhook` for failed webhook pushes
  - `mt_sync_queue_sheets` for failed Sheets pushes
- Each queue is retried independently on reconnect — a prior successful push is never duplicated
- `SyncBanner` shows total pending count with a "Sync now" button
- `useSyncQueue` auto-processes on `window.online` and on mount

---

## Storage structure

```ts
// localStorage
// Key: 'mt_config'               → Partial<Config>
// Key: 'mt_guide_checklist'      → Record<string, boolean>
// Key: 'mt_sync_queue_webhook'   → string[]  (expense IDs pending webhook push)
// Key: 'mt_sync_queue_sheets'    → string[]  (expense IDs pending Sheets push)

// IndexedDB — database: 'money-tracker' v1, store: 'expenses'
// Indexes: 'date', 'createdAt'
```

Never access storage directly — always go through `src/lib/storage.ts`.

---

## API routes: security model

The API routes are **thin proxies only**. They:

- Accept the user's credentials in the request body (not from env vars)
- Validate the payload with Zod before forwarding
- Never log credentials
- Return a typed JSON response: `{ ok: boolean; error?: string }`

---

## Coding conventions

- **TypeScript strict mode** — no `any`, no `ts-ignore`
- **Client Components** (`'use client'`) only when you need interactivity or browser APIs
- **Tailwind only** — no CSS modules, no inline style objects
- **Named exports** everywhere — no default exports except `page.tsx` and `layout.tsx`
- **Zod for all external data** — form inputs, API request bodies, storage reads
- **Error and loading states always handled** — never silently fail
- **`appearance-none` on all `<select>` elements** — paired with a `div relative` wrapper and an absolute-positioned chevron SVG
- **`evaluateAmount()` for all amount inputs** — supports arithmetic expressions (e.g. `12+8.50`)
- **UUID with fallback** — `crypto.randomUUID?.() ?? Math.random fallback` for non-HTTPS contexts

---

## Settings page layout

- **`/settings`** — hub page: links to Connect, Guide, Install, Integrations, Developer. Inline rows for Integrations and Currency.
- **`/settings/connect`** — `ConfigForm`: two independent panels (Webhook + Sheets API). Each saves/disconnects independently.
- **`/settings/guide`** — `SetupTabs`: step-by-step guide per integration with a persistent checklist

---

## Expense form behaviour (`/add`)

- Shows active integrations via `IntegrationStatusLine` (from `ModeStatusLine.tsx`)
- Fields: Amount, Category (select), Date (default today, capped at today — no future dates), Description (optional)
- Amount supports arithmetic expressions — `evaluateAmount()` parses `12+8.50` → `20.50`
- Zero-append buttons (+00, +000, +0000) shown for zero-decimal currencies
- On submit: validate → save to IndexedDB → push to all active integrations → show status

---

## History page behaviour (`/`)

- `SyncBanner` at the top shows offline queue status
- **Sheets sync row** (shown when Sheets is connected) — "Sync now" button triggers bidirectional sync via `useSheetsSync`; result shows "↓ N pulled · ↑ N pushed" or "Up to date"
- Month navigator to browse past months
- Category accordion — click total to expand breakdown
- Expense rows grouped by date with per-day total
- Three-dot menu per row → **Edit** (opens `EditExpenseModal`) or **Delete** (confirmation — warns that syncing will restore from Sheets)
- Always reads from IndexedDB (no remote fetch)
- CSV export exports the currently viewed month only (not all-time)

---

## PWA requirements

- `next-pwa` configured in `next.config.ts`, disabled in development
- `public/manifest.json` — `display: standalone`, `theme_color: #18181b`
- Icons: `public/icon-192.png` (192×192), `public/icon-512.png` (512×512) — must exist for install prompt
- Offline write always succeeds; API sync queues and retries when back online

---

## What NOT to do

- Do not add a database or auth system — credentials stay in localStorage
- Do not create separate repos or apps for the two modes
- Do not use `fetch` directly in components — always go through the API routes in `/api/`
- Do not hardcode any webhook URL or API key anywhere in source code
- Do not use `pages/` directory — App Router only
- Do not add UI libraries (shadcn, MUI, etc.) — Tailwind only
- Do not skip loading and error states
- Do not call `setState` synchronously inside `useEffect` — use `useState(() => ...)` lazy initializers for state derived from browser APIs (localStorage, URL params); guard with `typeof window === 'undefined'` for SSR
- Do not leave exported functions in `src/lib/` and `src/hooks/` without a one-line JSDoc comment

---

## Next improvements

- **Edit/delete propagation (Notion)** — when the user edits or deletes an expense locally, also PATCH/archive the corresponding Notion page. Look up the page by querying the database filtered on the `ID` title property (the expense `id` stored there), then call `PATCH /v1/pages/{page_id}` to update or `{ archived: true }` to delete. No separate page-ID storage needed.
- **Edit/delete propagation (Sheets)** — when the user edits or deletes an expense locally, find and update/remove the matching row in Google Sheets. Requires reading the sheet to locate the row by expense `id`, then using `batchUpdate` to overwrite or delete it.
- **Incremental sync (performance)** — store `mt_last_notion_sync` / `mt_last_sheets_sync` timestamps in localStorage. On each "Sync now", only fetch remote records newer than the last sync timestamp, then update the timestamp on success. Keep a "Full sync" option for first-time setup or recovery. Prevents slow syncs after months or years of data accumulation.
- **Receipt scan (camera → auto-fill)** — camera button on the Add expense form (file input with `capture="environment"`); use **Tesseract.js** (runs fully in-browser, no API key) to OCR the image, then parse the extracted text to pre-fill amount, date, and description. Gemini API would give better accuracy but requires a developer API key — cannot reuse the user's Google OAuth token since Gemini and Sheets API use different auth systems.
- **Split bill calculator** — simple version only: a "÷ people" input next to the amount field that divides the total and fills the amount. No new data model needed. Full debt-tracking (who owes whom across sessions) is out of scope for a personal tracker.
