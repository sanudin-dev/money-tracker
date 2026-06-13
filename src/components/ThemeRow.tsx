'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { ChevronDownIcon } from 'lucide-react'

const _noop = () => () => {}

/** Appearance selector that persists the user's theme preference to localStorage. */
export function ThemeRow() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(_noop, () => true, () => false)

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Appearance</p>
      {mounted ? (
        <div className="relative">
          <select
            value={theme ?? 'system'}
            onChange={(e) => setTheme(e.target.value)}
            className="appearance-none rounded-lg border border-zinc-200 bg-transparent py-1 pl-2 pr-7 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
            <ChevronDownIcon className="h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>
      ) : (
        <span className="h-7 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-800" aria-hidden />
      )}
    </div>
  )
}
