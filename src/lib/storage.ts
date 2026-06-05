import { openDB, type IDBPDatabase } from 'idb'
import { configSchema, storedExpenseSchema } from '@/lib/schema'
import type { Config, Expense } from '@/types'
import { STORAGE_KEYS } from '@/lib/constants'

const DB_NAME = 'money-tracker'
const DB_VERSION = 1
const STORE = 'expenses'

// Config uses localStorage (synchronous, suits frequent reads for small key-value data).
// Expenses use IndexedDB (async, larger quota, indexed queries by date/category).
// All reads run through Zod so corrupted or migrated data is silently dropped rather than crashing.

/** Returns the stored config, or {} if missing or invalid. */
export const getConfig = (): Partial<Config> => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) ?? '{}')
    const result = configSchema.partial().safeParse(raw)
    return result.success ? result.data : {}
  } catch {
    return {}
  }
}

/** Overwrites the stored config with the provided partial value. */
export const setConfig = (config: Partial<Config>) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
}

// DB connection is lazily opened once and reused — openDB is idempotent but
// creating the promise multiple times would spawn duplicate upgrade transactions.
let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('date', 'date')
          store.createIndex('createdAt', 'createdAt')
        }
      },
    })
  }
  return dbPromise
}

/** Returns all stored expenses, silently dropping any that fail schema validation. */
export async function getExpenses(): Promise<Expense[]> {
  const db = await getDb()
  const all = await db.getAll(STORE)
  return all.flatMap((item) => {
    const result = storedExpenseSchema.safeParse(item)
    return result.success ? [result.data] : []
  })
}

/** Inserts or replaces an expense (upsert by id). Called before any API request. */
export async function addExpense(expense: Expense): Promise<void> {
  const db = await getDb()
  await db.put(STORE, expense)
}

// deleteExpense and updateExpense only touch IndexedDB. There is no API call —
// integrations are append-only push channels. Changes made here are NOT reflected
// in connected integrations; users must edit the remote destination directly.

/** Removes an expense from IndexedDB. Does not affect the remote sheet. */
export async function deleteExpense(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, id)
}

/** Looks up a single expense by id. Used by useSyncQueue to build the API payload at sync time. */
export async function getExpenseById(id: string): Promise<Expense | undefined> {
  const db = await getDb()
  const item = await db.get(STORE, id)
  if (!item) return undefined
  const result = storedExpenseSchema.safeParse(item)
  return result.success ? result.data : undefined
}

/** Updates editable fields of an expense in IndexedDB. Does not affect the remote sheet. */
export async function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDb()
  const existing = (await db.get(STORE, id)) as Expense | undefined
  if (!existing) return
  await db.put(STORE, { ...existing, ...updates })
}
