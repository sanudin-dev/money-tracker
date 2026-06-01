# Storage

**Never access storage directly — always go through `src/lib/storage.ts`.**

---

## localStorage

Accessed via `useConfig` hook. Keys defined in `src/lib/constants.ts`.

| Key | Type | Contents |
|---|---|---|
| `mt_config` | `Partial<Config>` | Mode, credentials, currency code |
| `mt_guide_checklist` | `Record<string, boolean>` | Persistent checkbox state on `/settings/guide` |
| `mt_sync_queue` | `string[]` | Expense IDs queued for offline sync |

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

Three helpers in `src/lib/syncQueue.ts`:

```ts
getSyncQueue(): string[]          // read queue from localStorage
enqueueSync(id: string): void     // add expense ID if not already present
dequeueSync(id: string): void     // remove expense ID after successful sync
```

`useSyncQueue` hook auto-processes the queue on mount and on `window.online`.
