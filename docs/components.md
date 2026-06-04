# Components

## Entry / forms

| Component | File | Owns |
|---|---|---|
| `ExpenseForm` | `ExpenseForm.tsx` | Add expense form — amount (with expression eval), category, date, description. Saves to IndexedDB, then pushes to all active integrations concurrently. Renders `SyncBanner` above. |
| `EditExpenseModal` | `EditExpenseModal.tsx` | Edit an existing expense in a centered modal. |
| `ConfigForm` | `ConfigForm.tsx` | Webhook URL input and Sheets API OAuth connect button. Saves config to localStorage. |

---

## Navigation

| Component | File | Owns |
|---|---|---|
| `BottomNav` | `BottomNav.tsx` | Fixed bottom tab bar visible on mobile only (History, Add, Settings). Uses `usePathname` for active state. |
| `IntegrationStatusLine` | `ModeStatusLine.tsx` | Read-only one-liner showing active integrations + link to Settings. Rendered on `/add`. |

---

## History / display

| Component | File | Owns |
|---|---|---|
| `HistoryWrapper` | `HistoryWrapper.tsx` | Thin server-side wrapper. Mounts `HistoryClient`. |
| `HistoryClient` | `HistoryClient.tsx` | Month navigator, expense list grouped by date, category accordion, three-dot edit/delete menu, CSV export button (exports current month only). Shows a Sheets sync row (via `useSheetsSync`) when Sheets is connected. |
| `SyncBanner` | `SyncBanner.tsx` | Amber banner showing count of queued offline expenses. Has a manual "Sync now" button. Renders nothing when queue is empty. |

---

## Settings

| Component | File | Owns |
|---|---|---|
| `IntegrationRow` | `IntegrationRow.tsx` | Inline row on the Settings hub showing active integrations + link to `/settings/connect`. |
| `CurrencyRow` | `CurrencyRow.tsx` | Inline currency selector row on the Settings hub page. |
| `SetupTabs` | `SetupTabs.tsx` | Webhook / Sheets API step-by-step setup guide with persistent checklist (localStorage). |

---

## Infrastructure

| Component | File | Owns |
|---|---|---|
| `Providers` | `Providers.tsx` | Wraps the app in `ConfigProvider` (client boundary for the root layout). |
