'use client'

import { ListIcon, PlusCircleIcon, SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'History',
    icon: <ListIcon className="h-5 w-5" />,
  },
  {
    href: '/add',
    label: 'Add',
    icon: <PlusCircleIcon className="h-5 w-5" />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <SettingsIcon className="h-5 w-5" />,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-lg -translate-x-1/2 rounded-4xl border border-zinc-200/80 bg-white/95 shadow-lg backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/95">
      <div className="flex px-2">
        {TABS.map(({ href, label, icon }) => {
          const active =
            pathname === href || (href === '/settings' && pathname.startsWith('/settings'))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors ${
                active
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
