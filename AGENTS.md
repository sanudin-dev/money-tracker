# Money Tracker — Agent Guide

Local-first expense tracker. **Zapier** and **Sheets API** are independent output channels — both can be active simultaneously.
Next.js 16 App Router PWA. No backend database. All user data in the browser.

---

## Docs index

| Document | Covers |
|---|---|
| [Architecture](docs/architecture.md) | Data flow, core types, bidirectional sync, OAuth flow, PWA |
| [Storage](docs/storage.md) | localStorage keys, IndexedDB schema, sync queue |
| [API routes](docs/api-routes.md) | All four routes, request shapes, security model |
| [Components](docs/components.md) | What each component owns and renders |
| [Conventions](docs/conventions.md) | TypeScript rules, Tailwind, patterns, anti-patterns |

---

## Quick orientation

```
src/app/add/page.tsx          → ExpenseForm.tsx          (entry form)
src/app/page.tsx              → HistoryWrapper.tsx        (expense history)
src/app/settings/page.tsx     → IntegrationRow + CurrencyRow (settings hub)
src/app/settings/connect/     → ConfigForm.tsx            (credentials)
src/app/settings/guide/       → SetupTabs.tsx             (setup guide)
src/app/compare/page.tsx                                   (zapier vs sheets)
src/app/install/page.tsx                                   (PWA install guide)
src/app/dev/page.tsx                                       (developer notes)
src/app/privacy/page.tsx                                   (privacy policy)

src/hooks/useConfig.ts         read/write config (localStorage)
src/hooks/useSheetsSync.ts     bidirectional sync between IndexedDB and Google Sheets
src/hooks/useSyncQueue.ts      per-integration offline retry queues

src/lib/storage.ts             all IndexedDB access — never bypass this
src/lib/syncQueue.ts           enqueue/dequeue/get per-integration offline expense IDs
src/lib/constants.ts           API paths, localStorage keys, integration labels
src/types/index.ts             IntegrationType, Config, Expense types
```

---

## Key invariants

- Every expense is written to IndexedDB **before** any API call is attempted
- Credentials live in `localStorage` only — never stored server-side
- API routes are proxies: they validate with Zod, forward, and return `{ ok, error? }`
- The sync queue holds expense IDs, not expense data — storage.ts resolves them at sync time
- Service worker is disabled during development (`NODE_ENV === 'development'`)
- Use `useState(() => ...)` for state initialised from browser APIs (localStorage, URL params) — never `useEffect + setState` (triggers `react-hooks/set-state-in-effect`); guard with `typeof window === 'undefined'` for SSR safety
- All exported functions in `src/lib/` and `src/hooks/` must have a one-line JSDoc comment
