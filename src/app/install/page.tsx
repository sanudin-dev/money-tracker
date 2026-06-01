'use client'

import { useState } from 'react'

type Platform = 'android' | 'ios' | 'desktop'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'desktop', label: 'Desktop' },
]

function BrowserTag({ name, recommended }: { name: string; recommended?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        recommended
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
      }`}
    >
      {name}
    </span>
  )
}

function Step({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
        {n}
      </span>
      <div className="flex flex-col gap-1 pt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{title}</span>
        {children}
      </div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
      {children}
    </p>
  )
}

function AndroidGuide() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Recommended browsers:</span>
        <BrowserTag name="Chrome" recommended />
        <BrowserTag name="Samsung Internet" recommended />
        <BrowserTag name="Edge" recommended />
      </div>

      <Step n={1} title="Open the app in a supported browser">
        <span>Chrome, Samsung Internet, and Edge all support installation. Firefox on Android does not.</span>
      </Step>

      <Step n={2} title="Open the browser menu">
        <span>Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner of the browser.</span>
      </Step>

      <Step n={3} title='Tap "Add to Home Screen" or "Install app"'>
        <span>The wording varies by browser version — both do the same thing.</span>
      </Step>

      <Step n={4} title='Tap "Add" to confirm'>
        <span>The app icon appears on your home screen and launches like a native app — no browser bar.</span>
      </Step>

      <Note>
        Chrome may show a banner at the bottom saying{' '}
        <strong>&quot;Add Money Tracker to Home screen&quot;</strong> — you can tap that directly
        instead of going through the menu.
      </Note>

      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
        Firefox on Android does not support PWA installation.
      </div>
    </div>
  )
}

function IOSGuide() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Required:</span>
        <BrowserTag name="Safari" recommended />
      </div>

      <Note>
        On iOS, only Safari can install web apps. Chrome and Firefox on iOS cannot offer the
        &quot;Add to Home Screen&quot; option due to Apple&apos;s platform restrictions.
      </Note>

      <Step n={1} title="Open the app in Safari">
        <span>
          If you&apos;re in another browser, copy the URL and paste it into Safari.
        </span>
      </Step>

      <Step n={2} title="Tap the Share button">
        <span>
          Tap the <strong>Share icon</strong> — a box with an arrow pointing up — at the
          bottom centre of the Safari screen.
        </span>
      </Step>

      <Step n={3} title='Tap "Add to Home Screen"'>
        <span>
          Scroll down in the share sheet. It has a <strong>plus icon inside a square</strong>.
          If you don&apos;t see it, scroll further — it&apos;s not always at the top.
        </span>
      </Step>

      <Step n={4} title='Tap "Add" to confirm'>
        <span>
          Tap <strong>Add</strong> in the top-right corner. The app icon appears on your home
          screen and opens full-screen without the Safari browser bar.
        </span>
      </Step>
    </div>
  )
}

function DesktopGuide() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Recommended browsers:</span>
        <BrowserTag name="Chrome" recommended />
        <BrowserTag name="Edge" recommended />
      </div>

      <Step n={1} title="Open the app in Chrome or Edge">
        <span>Both browsers support PWA installation on Windows and macOS.</span>
      </Step>

      <Step n={2} title="Find the install icon in the address bar">
        <span>
          Look at the <strong>right side of the address bar</strong>&nbsp;for a small install icon —
          a monitor with a download arrow in Chrome, or a &apos;+&apos; in Edge. It appears after
          the page finishes loading.
        </span>
      </Step>

      <Step n={3} title='Click "Install"'>
        <span>
          Click the icon and confirm by clicking <strong>Install</strong> in the pop-up. The
          app opens as a standalone window — no tabs, no browser chrome.
        </span>
      </Step>

      <Note>
        Don&apos;t see the install icon? Refresh the page and wait for it to fully load. On
        first visit it can take a moment to appear.
      </Note>

      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
        Firefox and Safari on macOS do not support PWA installation. Use Chrome or Edge.
      </div>
    </div>
  )
}

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>('android')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3" />
          </svg>
          Install the app
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Add Money Tracker to your home screen for a full-screen, offline-ready experience.
        </p>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {PLATFORMS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPlatform(value)}
            className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              platform === value
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {platform === 'android' && <AndroidGuide />}
        {platform === 'ios' && <IOSGuide />}
        {platform === 'desktop' && <DesktopGuide />}
      </div>

      {/* Browser summary */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Browser support at a glance
        </p>
        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
          {[
            ['Android — Chrome, Samsung Internet, Edge', true],
            ['Android — Firefox', false],
            ['iOS — Safari', true],
            ['iOS — Chrome, Firefox', false],
            ['Desktop — Chrome, Edge', true],
            ['Desktop — Firefox, Safari (macOS)', false],
          ].map(([label, supported]) => (
            <div key={label as string} className="contents">
              <span className="text-zinc-600 dark:text-zinc-400">{label as string}</span>
              <span
                className={`text-right text-xs font-medium ${
                  supported
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {supported ? 'Supported' : 'Not supported'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
