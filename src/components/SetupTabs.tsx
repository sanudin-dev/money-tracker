'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { INTEGRATION_LABELS, STORAGE_KEYS } from '@/lib/constants'

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </code>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
        {n}
      </span>
      <div className="flex flex-col gap-1.5 pt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
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

const CHECKLIST: Record<'zapier' | 'sheets', string[]> = {
  zapier: [
    'Zapier account created (free tier works)',
    'Zap created with Webhooks by Zapier trigger',
    'Zap is turned on',
    'Webhook URL pasted in Settings',
  ],
  sheets: [
    'Google Sheet created (headers are added automatically on first sync)',
    'Spreadsheet ID copied from the Sheet URL',
    'Spreadsheet ID entered in Connect',
    'Google account connected via "Connect Google Sheets"',
  ],
}

function ZapierSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Expenses are forwarded to a Zapier webhook. Zapier can send the data anywhere — Google Sheets,
        Notion, Airtable, Slack, or any app it supports. History always shows your local log.
      </p>

      <Step n={1}>
        <span>
          Sign up at <span className="font-medium text-zinc-800 dark:text-zinc-200">zapier.com</span> (free tier is enough).
        </span>
      </Step>

      <Step n={2}>
        <span>Create a new Zap — <strong>Trigger</strong>:</span>
        <ul className="ml-4 list-disc space-y-1">
          <li>App: <strong>Webhooks by Zapier</strong> → Event: <strong>Catch Hook</strong></li>
          <li>Click <em>Continue</em>. Zapier shows a webhook URL — <strong>copy it.</strong></li>
        </ul>
      </Step>

      <Step n={3}>
        <span><strong>Action</strong> — pick any app Zapier supports. To write to Google Sheets:</span>
        <ul className="ml-4 list-disc space-y-1">
          <li>App: <strong>Google Sheets</strong> → Event: <strong>Create Spreadsheet Row</strong></li>
          <li>Connect your Google account, pick your spreadsheet and sheet tab</li>
          <li>
            Map fields from the payload:
            <div className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-0.5 font-mono text-xs">
              {[['ID', 'id'], ['Amount', 'amount'], ['Category', 'category'], ['Description', 'description'], ['Date', 'date'], ['Created At', 'createdAt']].map(([label, field]) => (
                <Fragment key={label}>
                  <span className="text-zinc-400">{label}</span>
                  <Code>{field}</Code>
                </Fragment>
              ))}
            </div>
          </li>
        </ul>
      </Step>

      <Step n={4}>
        <p>
          Turn on the Zap, then go to{' '}
          <Link href={'/settings/connect'} className="underline underline-offset-2">Connect</Link>,
          paste your webhook URL, and click <strong>Save</strong>.
        </p>
      </Step>

      <Note>
        Test by submitting one expense — Zapier&apos;s task history confirms whether the row was added.
      </Note>
    </div>
  )
}

function SheetsSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Expenses are written directly to Google Sheets via the API. The history page can read them back and you can export CSV — all from inside the app.
      </p>

      <Step n={1}>
        <span>
          Create an empty Google Sheet — no header row needed. The app writes{' '}
          <Code>ID | Amount | Category | Description | Date | Created At</Code>{' '}
          to row 1 automatically on the first sync.
        </span>
        <span>
          Copy the <strong>Spreadsheet ID</strong> from the URL:{' '}
          <Code>…/spreadsheets/d/<strong>YOUR_ID</strong>/edit</Code>
        </span>
      </Step>

      <Step n={2}>
        <p>
          Go to{' '}
          <Link href={'/settings/connect'} className="underline underline-offset-2">Connect</Link>,
          select <strong>Sheets API</strong>, enter your Spreadsheet ID, then click{' '}
          <strong>Connect Google Sheets</strong>. Approve the Google consent screen — done.
        </p>
        <Note>
          The app stores your connection so you only need to sign in once. No tokens to copy or manage.
        </Note>
      </Step>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Developer note:</span>{' '}
          Sheets API requires a one-time Google Cloud setup before users can connect.{' '}
          <Link href="/dev" className="underline underline-offset-2">See the Developer page →</Link>
        </p>
      </div>
    </div>
  )
}

type Tab = 'zapier' | 'sheets'

const TABS: { value: Tab; label: string }[] = [
  { value: 'zapier', label: INTEGRATION_LABELS.zapier },
  { value: 'sheets', label: INTEGRATION_LABELS.sheets },
]

export function SetupTabs() {
  const [tab, setTab] = useState<Tab>('zapier')
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GUIDE_CHECKLIST) ?? '{}') as Record<string, boolean>
    } catch {
      return {}
    }
  })

  function toggle(item: string) {
    setChecked((prev) => {
      const next = { ...prev, [item]: !prev[item] }
      localStorage.setItem(STORAGE_KEYS.GUIDE_CHECKLIST, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === value
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
        {tab === 'zapier' ? <ZapierSteps /> : <SheetsSteps />}
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Checklist</p>
        <div className="flex flex-col gap-2 text-sm">
          {CHECKLIST[tab].map((item) => (
            <label key={item} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={!!checked[item]}
                onChange={() => toggle(item)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-100"
              />
              {item}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
