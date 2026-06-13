import { GlobeOffIcon } from 'lucide-react'

export const metadata = {
  title: 'Offline — Money Tracker',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <GlobeOffIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">You are offline</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Reconnect to load this page. Expenses you have already added are safe on your device.
      </p>
    </div>
  )
}
