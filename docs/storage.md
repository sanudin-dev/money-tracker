# Storage

**Never access storage directly — always go through `src/lib/storage.ts`.**

---

## localStorage

Accessed via `useConfig` hook. Keys defined in `src/lib/constants.ts`.

| Key | Type | Contents |
|---|---|---|
| `mt_config` | `Partial<Config>` | Active integrations config, currency code |
| `mt_guide_checklist` | `Record<string, boolean>` | Persistent checkbox state on `/settings/guide` |
| `mt_sync_queue_webhook` | `string[]` | Expense IDs queued for offline webhook push |
| `mt_sync_queue_sheets` | `string[]` | Expense IDs queued for offline Sheets push |

---

## IndexedDB

Accessed via `idb` package. Defined in `src/lib/storage.ts`.

- **Database**: `money-tracker` v1
- **Store**: `expenses`
- **Indexes**: `date`, `createdAt`

### Exported functions

```ts
addExpense(expense: Expense): Promise<void>
getExpenses(): Promise<Expense[]>
getExpenseById(id: string): Promise<Expense | undefined>
updateExpense(expense: Expense): Promise<void>
deleteExpense(id: string): Promise<void>
```

---

## Sync queue

Per-integration retry queues. Each integration has its own key so a successful push to one integration is never re-sent on retry.

Three helpers in `src/lib/syncQueue.ts`:

```ts
getSyncQueue(integration: IntegrationType): string[]         // read queue from localStorage
enqueueSync(id: string, integration: IntegrationType): void  // add ID if not already present
dequeueSync(id: string, integration: IntegrationType): void  // remove ID after successful sync
```

`useSyncQueue` processes all active integration queues on mount and on `window.online`.
