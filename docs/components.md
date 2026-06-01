# Components

## Entry / forms

| Component | File | Owns |
|---|---|---|
| `ExpenseForm` | `ExpenseForm.tsx` | Add expense form — amount (with expression eval), category, date, description. Saves to IndexedDB, calls API if mode ≠ local. Renders `SyncBanner` above. |
| `EditExpenseModal` | `EditExpenseModal.tsx` | Edit an existing expense in a centered modal. |
| `ConfigForm` | `ConfigForm.tsx` | Zapier webhook URL input and Sheets API OAuth connect button. Saves config to localStorage. |

---

## Navigation

| Component | File | Owns |
|---|---|---|
| `BottomNav` | `BottomNav.tsx` | Fixed bottom tab bar visible on mobile only (History, Add, Settings). Uses `usePathname` for active state. |
| `ModeStatusLine` | `ModeStatusLine.tsx` | Read-only one-liner showing current mode + link to Settings. Rendered on `/add`. |
| `ModeToggle` | `ModeToggle.tsx` | Full mode switcher (Local / Zapier / Sheets API). |

---

## History / display

| Component | File | Owns |
|---|---|---|
| `HistoryWrapper` | `HistoryWrapper.tsx` | Thin server-side wrapper. Mounts `HistoryClient`. |
| `HistoryClient` | `HistoryClient.tsx` | Month navigator, expense list grouped by date, category accordion, three-dot edit/delete menu, CSV export button. |
| `SyncBanner` | `SyncBanner.tsx` | Amber banner showing count of queued offline expenses. Has a manual "Sync now" button. Renders nothing when queue is empty. |

---

## Settings

| Component | File | Owns |
|---|---|---|
| `IntegrationRow` | `IntegrationRow.tsx` | Inline mode selector row on the Settings hub page. |
| `CurrencyRow` | `CurrencyRow.tsx` | Inline currency selector row on the Settings hub page. |
| `SetupTabs` | `SetupTabs.tsx` | Zapier / Sheets API step-by-step setup guide with persistent checklist (localStorage). |

---

## Infrastructure

| Component | File | Owns |
|---|---|---|
| `Providers` | `Providers.tsx` | Wraps the app in `ConfigProvider` (client boundary for the root layout). |
