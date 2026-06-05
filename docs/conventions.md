# Coding conventions

## TypeScript

- Strict mode — no `any`, no `ts-ignore`
- Named exports everywhere — only `page.tsx` and `layout.tsx` use default exports
- Zod for all external data: form inputs, API request bodies, localStorage reads

## React / Next.js

- `'use client'` only when the component needs interactivity or browser APIs
- App Router only — no `pages/` directory
- Never use `fetch` directly in components — always go through the `/api/` routes

## Styling

- Tailwind only — no CSS modules, no inline style objects
- All `<select>` elements use `appearance-none` with a `.relative` wrapper div and an absolute-positioned chevron SVG (cross-browser consistency)

## React state initialization

- Use `useState(() => ...)` (lazy initializer) for state that reads from browser APIs on mount: `localStorage`, `sessionStorage`, `URLSearchParams`. This runs synchronously once, avoids a cascading render, and satisfies the `react-hooks/set-state-in-effect` lint rule.
- Do NOT use `useEffect` + `setState` for this pattern — it causes an extra render and triggers the linter.
- Exception: async reads (e.g. IndexedDB via `idb`) must still use `useEffect` because lazy initializers are synchronous.

```ts
// ✓ correct — reads localStorage once at mount
const [checked, setChecked] = useState<Record<string, boolean>>(() => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
})

// ✗ wrong — causes cascading render, triggers lint rule
const [checked, setChecked] = useState<Record<string, boolean>>({})
useEffect(() => {
  setChecked(JSON.parse(localStorage.getItem(KEY) ?? '{}'))
}, [])
```

## Documentation comments

- All exported functions in `src/lib/` and `src/hooks/` must have a JSDoc comment (one line is enough).
- Components don't need JSDoc — their name and props type serve as documentation.
- Inline comments are for non-obvious WHY, not WHAT.

## Patterns

- Amount inputs: always run through `evaluateAmount()` — supports arithmetic like `12+8.50`
- UUIDs: `crypto.randomUUID?.() ?? Math.random fallback` for non-HTTPS contexts
- Storage: never call IndexedDB or localStorage directly — go through `src/lib/storage.ts`
- Config: read/write only via `useConfig` hook
- Error and loading states: always handle them — never silently fail

## What NOT to do

- Do not add a database or auth system — credentials stay in localStorage
- Do not create separate repos for different modes
- Do not add UI libraries (shadcn, MUI, etc.)
- Do not hardcode any webhook URL or API key in source code
- Do not use the `pages/` directory
- Do not skip loading or error states
