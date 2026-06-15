import { ArrowRightLeft } from "lucide-react";

type Row = { label: string; webhook: string; sheets: string; notion: string }

const ROWS: Row[] = [
  {
    label: 'Setup (as a user)',
    webhook: '~5 min — create a webhook trigger, paste the URL in Connect',
    sheets: '~2 min — create a Sheet, click Connect Google Sheets',
    notion: '~3 min — create a Notion integration, paste the token and database ID in Connect',
  },
  {
    label: 'Write expenses',
    webhook: 'Yes — automation platform appends a row on each submission',
    sheets: 'Yes — written directly to your Google Sheet via the API',
    notion: 'Yes — written directly to your Notion database via the API',
  },
  {
    label: 'History source',
    webhook: 'Your local device (IndexedDB)',
    sheets: 'Your local device (IndexedDB)',
    notion: 'Your local device (IndexedDB)',
  },
  {
    label: 'CSV export',
    webhook: 'Yes — exports the currently viewed month from your local history',
    sheets: 'Yes — exports the currently viewed month from your local history',
    notion: 'Yes — exports the currently viewed month from your local history',
  },
  {
    label: 'Multi-device sync',
    webhook: 'Not supported',
    sheets:
      'Yes — "Sync now" pulls rows from the sheet missing on this device and pushes local expenses not yet in the sheet',
    notion:
      'Yes — "Sync now" pulls pages from the database missing on this device and pushes local expenses not yet in Notion',
  },
  {
    label: 'Edit / delete',
    webhook: 'In app — changes stay local; destination not updated',
    sheets: 'In app — changes stay local; destination not updated',
    notion: 'In app — changes stay local; destination not updated',
  },
  {
    label: 'Security',
    webhook: 'Webhook URL is a shared secret — keep it private',
    sheets: 'Google sign-in — only your Google account can access',
    notion: 'Integration Token is a shared secret — keep it private',
  },
  {
    label: 'Flexibility',
    webhook:
      'Swap the destination (Notion, Airtable, Slack) with zero code changes inside your automation',
    sheets: 'Full API control — extend or transform data in code without a third-party platform',
    notion: 'Full API control — query, filter, or enrich your expense data directly in Notion',
  },
  {
    label: 'Reliability',
    webhook:
      'Adds a third-party hop — failures are logged in the automation platform but invisible to the app',
    sheets: 'Direct call — failures surface immediately as inline errors; no hidden failure states',
    notion: 'Direct call — failures surface immediately as inline errors; no hidden failure states',
  },
  {
    label: 'Latency',
    webhook: 'Slightly slower — request travels app → automation platform → destination',
    sheets: 'Direct — one API call to Google after a token refresh',
    notion: 'Direct — one API call to Notion',
  },
  {
    label: 'Price',
    webhook: 'Varies by platform — Zapier/Make free tiers cover personal use',
    sheets: 'Free — Google Sheets API has no per-request cost for personal use',
    notion: 'Free — Notion API has no per-request cost for personal use',
  },
  {
    label: 'Vendor lock-in',
    webhook: 'Tied to the automation platform — moving means rebuilding the workflow elsewhere',
    sheets:
      'Only depends on Google Sheets API — no third-party automation platform in the write path',
    notion:
      'Only depends on Notion API — data lands in your own Notion workspace',
  },
  {
    label: 'Offline',
    webhook: 'Expense saved to device — queued and synced automatically when back online',
    sheets: 'Expense saved to device — queued and synced automatically when back online',
    notion: 'Expense saved to device — queued and synced automatically when back online',
  },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </section>
  )
}

export const metadata = {
  title: 'Integrations — Money Tracker',
  description:
    'What Webhook, Sheets API, and Notion each give you — all integrations can be active at the same time.',
  openGraph: {
    title: 'Integrations — Money Tracker',
    description:
      'What Webhook, Sheets API, and Notion each give you — all integrations can be active at the same time.',
    url: '/compare',
    siteName: 'Money Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Integrations — Money Tracker',
    description:
      'What Webhook, Sheets API, and Notion each give you — all integrations can be active at the same time.',
  },
}

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ArrowRightLeft className="h-6 w-6" />
          Integrations
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Three ways to sync expenses to external services. All can be active at the same time —
          every new expense is sent to all configured integrations.
        </p>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500"></span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Webhook
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Sheets API
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Notion
            </span>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-4 gap-4 px-4 py-3 text-sm ${
                i < ROWS.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
              }`}
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{row.label}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{row.webhook}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{row.sheets}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{row.notion}</span>
            </div>
          ))}
        </div>
      </div>

      <Section title="What Webhook gives you">
        <p>
          The webhook integration turns this app into a trigger for any automation platform —
          Zapier, Make, Pipedream, n8n, or a custom endpoint. Paste a webhook URL and expenses are
          forwarded there on every submission. From there, the platform can send the data anywhere:
          Google Sheets, Notion, Airtable, Slack, email, or any app it supports.
        </p>
        <p className="mt-2">
          It&apos;s the easiest way to add server-side logic without writing code. Use the optional
          App ID field with a filter step in your automation to route expenses from different apps
          to different destinations. Most platforms offer a free tier that covers everyday personal
          tracking.
        </p>
      </Section>

      <Section title="What Sheets API gives you">
        <p>
          Sheets API is a direct connection to Google Sheets with no intermediary. After a one-time
          sign-in, the app writes directly to your spreadsheet with no task limits, no monthly
          costs, and no third-party platform in the write path.
        </p>
        <p className="mt-2">
          The connection persists indefinitely and can be revoked at any time from your Google
          account settings. If you want a reliable, free backup of your expenses that doesn&apos;t
          expire on a task counter, this is a solid choice.
        </p>
        <p className="mt-2">
          Sheets supports{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">multi-device sync</strong>. The
          &ldquo;Sync now&rdquo; button on the history page pulls any rows from the sheet that
          aren&apos;t on the current device yet, and pushes any local expenses that haven&apos;t
          reached the sheet. Two people sharing the same spreadsheet ID can use this to keep their
          histories in sync.
        </p>
      </Section>

      <Section title="What Notion gives you">
        <p>
          Notion gives you a structured database inside your existing Notion workspace — no Google
          account needed. Set up a Notion integration, share your database with it, paste the token
          and database ID in Connect, and expenses are written directly to Notion on every submission.
        </p>
        <p className="mt-2">
          Like Sheets, Notion supports{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">multi-device sync</strong>. The
          &ldquo;Sync now&rdquo; button pulls pages from the database that aren&apos;t on this
          device yet and pushes local expenses not yet in Notion. The expense{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">id</strong> is the dedup key — no
          entry is ever duplicated on either side.
        </p>
        <p className="mt-2">
          The integration token is encrypted before being stored locally, so the plaintext token
          never persists on the device. No OAuth flow is needed — the token comes from the Notion
          integration settings page in your workspace.
        </p>
      </Section>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Building or deploying this app?{' '}
          <a
            href="/dev"
            className="font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            See the Developer page
          </a>{' '}
          for the technical comparison and one-time server setup guide.
        </p>
      </div>
    </div>
  )
}
