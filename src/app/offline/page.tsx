export const metadata = {
  title: 'Offline — Money Tracker',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-10 w-10 text-zinc-300 dark:text-zinc-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M8.111 8.111A5.985 5.985 0 006 12a6 6 0 006 6 5.985 5.985 0 003.889-1.445M16.243 7.757A6 6 0 0012 6c-.88 0-1.716.19-2.47.528M12 3v1M3.6 18.4l-.6.6M19.07 4.93l-.707.707"
        />
      </svg>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">You are offline</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Reconnect to load this page. Expenses you have already added are safe on your device.
      </p>
    </div>
  )
}
