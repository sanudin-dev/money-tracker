'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { STORAGE_KEYS } from '@/lib/constants'
import { INTEGRATION_META } from '@/components/icons'

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

const PAYLOAD_FIELDS: [string, string][] = [
  ['ID', 'id'],
  ['Amount', 'amount'],
  ['Category', 'category'],
  ['Description', 'description'],
  ['Date', 'date'],
  ['Created At', 'createdAt'],
]

function FieldMap() {
  return (
    <div className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-0.5 font-mono text-xs">
      {PAYLOAD_FIELDS.map(([label, field]) => (
        <Fragment key={label}>
          <span className="text-zinc-400">{label}</span>
          <Code>{field}</Code>
        </Fragment>
      ))}
    </div>
  )
}

function ZapierSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Use Zapier&apos;s{' '}
        <strong className="text-zinc-700 dark:text-zinc-300">Webhooks by Zapier</strong> trigger to
        receive expenses and route them to any app Zapier supports.
      </p>
      <Step n={1}>
        <span>
          Sign up at{' '}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">zapier.com</span> (free
          tier is enough).
        </span>
      </Step>
      <Step n={2}>
        <span>
          Create a new Zap — <strong>Trigger</strong>:
        </span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            App: <strong>Webhooks by Zapier</strong> → Event: <strong>Catch Hook</strong>
          </li>
          <li>
            Click <em>Continue</em>. Zapier shows a webhook URL — <strong>copy it.</strong>
          </li>
        </ul>
      </Step>
      <Step n={3}>
        <span>
          <strong>Action</strong> — pick any app Zapier supports. To write to Google Sheets:
        </span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            App: <strong>Google Sheets</strong> → Event: <strong>Create Spreadsheet Row</strong>
          </li>
          <li>Connect your Google account, pick your spreadsheet and sheet tab</li>
          <li>
            Map fields from the payload:
            <FieldMap />
          </li>
        </ul>
      </Step>
      <Step n={4}>
        <p>
          Turn on the Zap, then go to{' '}
          <Link href="/settings/connect" className="underline underline-offset-2">
            Connect
          </Link>
          , paste your webhook URL, and click <strong>Save</strong>.
        </p>
      </Step>
      <Note>
        Test by submitting one expense — Zapier&apos;s task history confirms whether the row was
        added.
      </Note>
    </div>
  )
}

function MakeSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Use Make&apos;s <strong className="text-zinc-700 dark:text-zinc-300">Webhooks</strong>{' '}
        module as the trigger to receive expenses and route them to any app Make supports.
      </p>
      <Step n={1}>
        <span>
          Sign up at <span className="font-medium text-zinc-800 dark:text-zinc-200">make.com</span>{' '}
          (free tier is enough).
        </span>
      </Step>
      <Step n={2}>
        <span>Create a new Scenario — add the first module:</span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            Search for <strong>Webhooks</strong> → select <strong>Custom webhook</strong>
          </li>
          <li>
            Click <strong>Add</strong> to create a webhook — Make shows a URL.{' '}
            <strong>Copy it.</strong> Click <em>OK</em> to close the dialog.
          </li>
        </ul>
      </Step>
      <Step n={3}>
        <p>
          Go to{' '}
          <Link href="/settings/connect" className="underline underline-offset-2">
            Connect
          </Link>
          , paste your webhook URL, and click <strong>Save</strong>. The app needs the URL saved
          before it can send Make a test payload.
        </p>
      </Step>
      <Step n={4}>
        <span>
          Back in Make, click <strong>Determine data structure</strong> — Make waits for a hit.
          Switch to the{' '}
          <Link href="/add" className="underline underline-offset-2">
            Add expense
          </Link>{' '}
          page and submit one expense. Make reads the payload and auto-maps the fields.
        </span>
      </Step>
      <Step n={5}>
        <span>Add an action module. To write to Google Sheets:</span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Google Sheets</strong> → <strong>Add a Row</strong>
          </li>
          <li>Connect your Google account, pick your spreadsheet and sheet</li>
          <li>
            Map fields from the webhook data:
            <FieldMap />
          </li>
        </ul>
      </Step>
      <Step n={6}>
        <p>Turn on the scenario (toggle bottom-left) — you&apos;re all set.</p>
      </Step>
      <Note>
        Make&apos;s scenario history shows each run — use it to confirm the expense was received and
        processed.
      </Note>
    </div>
  )
}

function PipedreamSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Pipedream&apos;s{' '}
        <strong className="text-zinc-700 dark:text-zinc-300">HTTP / Webhook</strong> trigger gives
        you a URL and lets you build action steps with pre-built app integrations or custom code.
      </p>
      <Step n={1}>
        <span>
          Sign up at{' '}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">pipedream.com</span> (free
          tier is enough).
        </span>
      </Step>
      <Step n={2}>
        <span>Create a new workflow:</span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            Trigger: <strong>HTTP / Webhook</strong> → <strong>New Requests</strong>
          </li>
          <li>
            Pipedream shows a unique endpoint URL — <strong>copy it.</strong>
          </li>
        </ul>
      </Step>
      <Step n={3}>
        <span>
          Add an action step. Fields arrive under <Code>steps.trigger.event.body</Code> — for
          example <Code>steps.trigger.event.body.amount</Code> or{' '}
          <Code>steps.trigger.event.body.category</Code>.
        </span>
        <span>
          For a ready-made integration, search the app you want (e.g.{' '}
          <strong>Google Sheets → Add Single Row</strong>) and map the columns.
        </span>
      </Step>
      <Step n={4}>
        <p>
          Deploy the workflow, then go to{' '}
          <Link href="/settings/connect" className="underline underline-offset-2">
            Connect
          </Link>
          , paste your endpoint URL, and click <strong>Save</strong>.
        </p>
      </Step>
      <Note>
        Pipedream&apos;s event inspector shows each incoming request in real time — useful for
        confirming the payload shape before building action steps.
      </Note>
    </div>
  )
}

function N8nSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        n8n&apos;s <strong className="text-zinc-700 dark:text-zinc-300">Webhook</strong> node
        exposes an endpoint you control — available on n8n Cloud or self-hosted.
      </p>
      <Step n={1}>
        <span>
          Sign up at <span className="font-medium text-zinc-800 dark:text-zinc-200">n8n.io</span>{' '}
          (cloud) or set up a self-hosted instance.
        </span>
      </Step>
      <Step n={2}>
        <span>
          Create a new workflow — add a <strong>Webhook</strong> node:
        </span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            HTTP Method: <strong>POST</strong>
          </li>
          <li>
            Authentication: <strong>None</strong> (or add header auth if preferred)
          </li>
          <li>
            Copy the <strong>Production URL</strong> shown in the node panel.
          </li>
        </ul>
      </Step>
      <Step n={3}>
        <span>
          Add an action node. Fields arrive in <Code>{'{{ $json.body }}'}</Code> — for example to
          write to Google Sheets:
        </span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            Add a <strong>Google Sheets</strong> node → <strong>Append Row to Sheet</strong>
          </li>
          <li>
            Map columns using expressions like <Code>{'{{ $json.body.amount }}'}</Code>
          </li>
        </ul>
      </Step>
      <Step n={4}>
        <p>
          Activate the workflow (toggle top-right), then go to{' '}
          <Link href="/settings/connect" className="underline underline-offset-2">
            Connect
          </Link>
          , paste your Production URL, and click <strong>Save</strong>.
        </p>
      </Step>
      <Note>
        Use the Test URL during setup to inspect the payload in n8n&apos;s execution log — switch to
        the Production URL before saving in Settings.
      </Note>
    </div>
  )
}

function NotionSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Expenses are pushed directly to a{' '}
        <strong className="text-zinc-700 dark:text-zinc-300">Notion database</strong> using an
        Integration Token. No OAuth — just a static key you copy once.
      </p>

      <Step n={1}>
        <span>Open the Notion developer portal — pick whichever path fits your setup:</span>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Browser:</strong> go to{' '}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              notion.so/developers/connections
            </span>{' '}
            and sign in
          </li>
          <li>
            <strong>Desktop app:</strong> open Settings → Connections → click{' '}
            <strong>Go to developer portal</strong>
          </li>
          <li>
            <strong>Desktop app (alternative):</strong> open any database → <strong>⋯ → Connections → Manage connections</strong> → click{' '}
            <strong>Go to developer portal</strong>
          </li>
        </ul>
        <span>
          Click <strong>New connection</strong>, give it any name (e.g. Money Tracker), leave
          capabilities as-is, then click <strong>Save</strong> and copy the{' '}
          <strong>Access token</strong>.
        </span>
      </Step>

      <Step n={2}>
        <span>
          Create a new Notion database (full-page or inline) with these{' '}
          <strong>exact property names and types</strong>:
        </span>
        <div className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-0.5 font-mono text-xs">
          {(
            [
              ['ID', 'Title'],
              ['Amount', 'Number'],
              ['Category', 'Select'],
              ['Description', 'Text'],
              ['Date', 'Date'],
              ['Created At', 'Text'],
            ] as [string, string][]
          ).map(([prop, type]) => (
            <Fragment key={prop}>
              <Code>{prop}</Code>
              <span className="text-zinc-400">{type}</span>
            </Fragment>
          ))}
        </div>
      </Step>

      <Step n={3}>
        <span>
          Connect your integration to the database — open the database, click{' '}
          <strong>⋯ → Connections → Connect to</strong> and pick your integration.
        </span>
      </Step>

      <Step n={4}>
        <span>
          Copy the <strong>Database ID</strong> from the database URL:
        </span>
        <Code>notion.so/your-workspace/<strong>DATABASE_ID</strong>?v=…</Code>
        <span className="text-xs text-zinc-400">
          It&apos;s the 32-character segment before the <Code>?v=</Code> query string.
        </span>
      </Step>

      <Step n={5}>
        <p>
          Go to{' '}
          <Link href="/settings/connect" className="underline underline-offset-2">
            Connect
          </Link>
          , enter your Database ID and Access token, then click <strong>Save</strong>.
        </p>
      </Step>

      <Note>
        Test by submitting one expense — a new row should appear in your Notion database within a
        second.
      </Note>
    </div>
  )
}

function SheetsSteps() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Expenses are written directly to Google Sheets via the API. The history page can read them
        back and you can export CSV — all from inside the app.
      </p>

      <Step n={1}>
        <span>
          Create an empty Google Sheet — no header row needed. The app writes{' '}
          <Code>ID | Amount | Category | Description | Date | Created At</Code> to row 1
          automatically on the first sync.
        </span>
        <span>
          Copy the <strong>Spreadsheet ID</strong> from the URL:{' '}
          <Code>
            …/spreadsheets/d/<strong>YOUR_ID</strong>/edit
          </Code>
        </span>
      </Step>

      <Step n={2}>
        <p>
          Go to{' '}
          <Link href="/settings/connect" className="underline underline-offset-2">
            Connect
          </Link>
          , select <strong>Sheets API</strong>, enter your Spreadsheet ID, then click{' '}
          <strong>Connect Google Sheets</strong>. Approve the Google consent screen — done.
        </p>
        <Note>
          The app stores your connection so you only need to sign in once. No tokens to copy or
          manage.
        </Note>
      </Step>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Developer note:</span>{' '}
          Sheets API requires a one-time Google Cloud setup before users can connect.{' '}
          <Link href="/dev" className="underline underline-offset-2">
            See the Developer page →
          </Link>
        </p>
      </div>
    </div>
  )
}

type WebhookPlatform = 'zapier' | 'make' | 'pipedream' | 'n8n'

const WEBHOOK_PLATFORMS: { value: WebhookPlatform; label: string }[] = [
  { value: 'zapier', label: 'Zapier' },
  { value: 'make', label: 'Make' },
  { value: 'pipedream', label: 'Pipedream' },
  { value: 'n8n', label: 'n8n' },
]

const WEBHOOK_CHECKLIST: Record<WebhookPlatform, string[]> = {
  zapier: [
    'Zapier account created',
    'Zap created with Webhooks by Zapier → Catch Hook trigger',
    'Action step set up and Zap turned on',
    'Webhook URL pasted in Settings → Connect',
  ],
  make: [
    'Make account created',
    'Scenario created with Webhooks → Custom webhook trigger',
    'Webhook URL pasted in Settings → Connect',
    'Data structure determined (test expense submitted)',
    'Action module set up and scenario turned on',
  ],
  pipedream: [
    'Pipedream account created',
    'Workflow created with HTTP / Webhook trigger',
    'Action step set up and workflow deployed',
    'Endpoint URL pasted in Settings → Connect',
  ],
  n8n: [
    'n8n account or instance ready',
    'Workflow created with Webhook node (POST, Production URL)',
    'Action node set up and workflow activated',
    'Production URL pasted in Settings → Connect',
  ],
}

const SHEETS_CHECKLIST = [
  'Google Sheet created (headers are added automatically on first sync)',
  'Spreadsheet ID copied from the Sheet URL',
  'Spreadsheet ID entered in Connect',
  'Google account connected via "Connect Google Sheets"',
]

const NOTION_CHECKLIST = [
  'Notion account ready',
  'Connections created at notion.so/developers/connections',
  'Integration token (Access token) copied',
  'Notion database created with required properties',
  'Connections connected to the database',
  'Database ID and token entered in Settings → Connect',
]

type Tab = 'webhook' | 'sheets' | 'notion'

const TABS: Tab[] = ['webhook', 'sheets', 'notion']

/** Step-by-step setup guide for each integration, with a persistent checklist. */
export function SetupTabs() {
  const [tab, setTab] = useState<Tab>('webhook')
  const [platform, setPlatform] = useState<WebhookPlatform>('zapier')
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GUIDE_CHECKLIST) ?? '{}') as Record<
        string,
        boolean
      >
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

  const activeChecklist =
    tab === 'sheets' ? SHEETS_CHECKLIST :
    tab === 'notion' ? NOTION_CHECKLIST :
    WEBHOOK_CHECKLIST[platform]

  return (
    <div className="flex flex-col gap-6">
      {/* Top-level tab bar */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {TABS.map((value) => {
          const { label, Icon } = INTEGRATION_META[value]
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`flex flex-col flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Steps */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {tab === 'notion' ? (
          <NotionSteps />
        ) : tab === 'sheets' ? (
          <SheetsSteps />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Platform sub-tabs */}
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {WEBHOOK_PLATFORMS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPlatform(value)}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    platform === value
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {platform === 'zapier' && <ZapierSteps />}
            {platform === 'make' && <MakeSteps />}
            {platform === 'pipedream' && <PipedreamSteps />}
            {platform === 'n8n' && <N8nSteps />}
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Checklist</p>
        <div className="flex flex-col gap-2 text-sm">
          {activeChecklist.map((item) => (
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
