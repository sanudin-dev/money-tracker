# Components

## Entry / forms

| Component          | File                   | Owns                                                                                                                                                                                                              |
| ------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ExpenseForm`      | `ExpenseForm.tsx`      | Add expense form — amount (with expression eval), category, date, description. Saves to IndexedDB, then pushes to all active integrations concurrently. Renders `SyncBanner` above.                               |
| `EditExpenseModal` | `EditExpenseModal.tsx` | Edit an existing expense in a centered modal.                                                                                                                                                                     |
| `ConfigForm`       | `ConfigForm.tsx`       | Three independent credential panels: Webhook URL input, Sheets API OAuth connect button, Notion database ID + integration token input. Each panel saves and disconnects independently. Saves config to localStorage. |

---

## Navigation

| Component               | File                 | Owns                                                                                                                                   |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `BottomNav`             | `BottomNav.tsx`      | Fixed bottom tab bar visible on mobile only (History, Add, Settings). Uses `usePathname` for active state.                             |
| `IntegrationStatusLine` | `ModeStatusLine.tsx` | Read-only one-liner showing active integration icons (with hover tooltips) + link to Settings. Rendered on `/add`. Uses `INTEGRATION_META`. |

---

## History / display

| Component        | File                 | Owns                                                                                                                                                                                                                                                              |
| ---------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HistoryWrapper` | `HistoryWrapper.tsx` | Thin server-side wrapper. Mounts `HistoryClient`.                                                                                                                                                                                                                 |
| `HistoryClient`  | `HistoryClient.tsx`  | Month navigator, expense list grouped by date, category accordion, three-dot edit/delete menu, CSV export button (exports current month only). Listens for `mt:sheets-pull` and `mt:notion-pull` events to reload after bidirectional sync pulls remote expenses. |
| `SyncBanner`     | `SyncBanner.tsx`     | "Data sync" bar at top of history. "Sync now" button triggers offline queue flush + bidirectional sync for Sheets and Notion. After sync, shows per-integration result lines (icon + "↓ N pulled · ↑ N pushed" or "Up to date"). Hides when no integrations active. |

---

## Settings

| Component        | File                 | Owns                                                                                                                           |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `IntegrationRow` | `IntegrationRow.tsx` | Inline row on the Settings hub showing active integration icons (with hover tooltips) + link to `/settings/connect`. Uses `INTEGRATION_META`. |
| `CurrencyRow`    | `CurrencyRow.tsx`    | Inline currency selector row on the Settings hub page.                                                                         |
| `SetupTabs`      | `SetupTabs.tsx`      | Webhook / Sheets API / Notion step-by-step setup guide with persistent checklist (localStorage). Tab bar shows integration icon + label per tab via `INTEGRATION_META`. |

---

## Infrastructure

| Component   | File            | Owns                                                                                                          |
| ----------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| `Providers` | `Providers.tsx` | Wraps the app in `ConfigProvider` (client boundary for the root layout).                                      |
| —           | `icons.tsx`     | Brand SVG icons (`NotionIcon`, `SheetsIcon`, `GoogleIcon`) and `INTEGRATION_META` — single source of truth for each integration's icon and label. |
