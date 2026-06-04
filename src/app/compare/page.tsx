type Row = { label: string; webhook: string; sheets: string }

const ROWS: Row[] = [
  {
    label: 'Setup (as a user)',
    webhook: '~5 min — create a webhook trigger, paste the URL in Connect',
    sheets: '~2 min — create a Sheet, click Connect Google Sheets',
  },
  {
    label: 'Write expenses',
    webhook: 'Yes — automation platform appends a row on each submission',
    sheets: 'Yes — written directly to your Google Sheet via the API',
  },
  {
    label: 'History source',
    webhook: 'Your local device (IndexedDB)',
    sheets: 'Your local device (IndexedDB)',
  },
  {
    label: 'CSV export',
    webhook: 'Yes — exports the currently viewed month from your local history',
    sheets: 'Yes — exports the currently viewed month from your local history',
  },
  {
    label: 'Multi-device sync',
    webhook: 'Not supported',
    sheets: 'Yes — "Sync now" pulls rows from the sheet missing on this device and pushes local expenses not yet in the sheet',
  },
  {
    label: 'Edit / delete',
    webhook: 'In app — changes stay local; destination not updated',
    sheets: 'In app — changes stay local; destination not updated',
  },
  {
    label: 'Security',
    webhook: 'Webhook URL is a shared secret — keep it private',
    sheets: 'Google sign-in — only your Google account can access',
  },
  {
    label: 'Flexibility',
    webhook: 'Swap the destination (Notion, Airtable, Slack) with zero code changes inside your automation',
    sheets: 'Full API control — extend or transform data in code without a third-party platform',
  },
  {
    label: 'Reliability',
    webhook: 'Adds a third-party hop — failures are logged in the automation platform but invisible to the app',
    sheets: 'Direct call — failures surface immediately as inline errors; no hidden failure states',
  },
  {
    label: 'Latency',
    webhook: 'Slightly slower — request travels app → automation platform → destination',
    sheets: 'Direct — one API call to Google after a token refresh',
  },
  {
    label: 'Price',
    webhook: 'Varies by platform — Zapier/Make free tiers cover personal use',
    sheets: 'Free — Google Sheets API has no per-request cost for personal use',
  },
  {
    label: 'Vendor lock-in',
    webhook: 'Tied to the automation platform — moving means rebuilding the workflow elsewhere',
    sheets: 'Only depends on Google Sheets API — no third-party automation platform in the write path',
  },
  {
    label: 'Offline',
    webhook: 'Expense saved to device — queued and synced automatically when back online',
    sheets: 'Expense saved to device — queued and synced automatically when back online',
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
  description: 'What Webhook and Sheets API each give you — both integrations can be active at the same time.',
}

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Integrations
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Two ways to push expenses to Google Sheets. Both can be active at the same time — every new expense is sent to all configured integrations.
        </p>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
      <div className="min-w-[540px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500"></span>
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">Webhook</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">Sheets API</span>
        </div>
        {ROWS.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-3 gap-4 px-4 py-3 text-sm ${
              i < ROWS.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
            }`}
          >
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{row.label}</span>
            <span className="text-zinc-600 dark:text-zinc-400">{row.webhook}</span>
            <span className="text-zinc-600 dark:text-zinc-400">{row.sheets}</span>
          </div>
        ))}
      </div>
      </div>

      <Section title="What Webhook gives you">
        <p>
          The webhook integration turns this app into a trigger for any automation platform —
          Zapier, Make, Pipedream, n8n, or a custom endpoint. Paste a webhook URL and expenses
          are forwarded there on every submission. From there, the platform can send the data
          anywhere: Google Sheets, Notion, Airtable, Slack, email, or any app it supports.
        </p>
        <p className="mt-2">
          It&apos;s the easiest way to add server-side logic without writing code. Use the optional
          App ID field with a filter step in your automation to route expenses from different
          apps to different destinations. Most platforms offer a free tier that covers everyday
          personal tracking.
        </p>
      </Section>

      <Section title="What Sheets API gives you">
        <p>
          Sheets API is a direct connection to Google Sheets with no intermediary. After a one-time
          sign-in, the app writes directly to your spreadsheet with no task limits, no monthly costs,
          and no third-party platform in the write path.
        </p>
        <p className="mt-2">
          The connection persists indefinitely and can be revoked at any time from your Google account
          settings. If you want a reliable, free backup of your expenses that doesn&apos;t expire
          on a task counter, this is the right integration.
        </p>
        <p className="mt-2">
          It&apos;s also the only integration that supports <strong className="text-zinc-700 dark:text-zinc-300">multi-device sync</strong>.
          The &ldquo;Sync now&rdquo; button on the history page pulls any rows from the sheet that
          aren&apos;t on the current device yet, and pushes any local expenses that haven&apos;t
          reached the sheet. Two people sharing the same spreadsheet ID can use this to keep
          their histories in sync.
        </p>
      </Section>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Building or deploying this app?{' '}
          <a href="/dev" className="font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300">
            See the Developer page
          </a>{' '}
          for the technical comparison and one-time server setup guide.
        </p>
      </div>
    </div>
  )
}
