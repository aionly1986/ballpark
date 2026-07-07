# Ballpark

Free, interactive **settlement calculators** that rank in Google and convert
visitors into qualified legal leads. Niche one: US personal injury settlement
estimation.

Each calculator is one page targeting one search term. The calculator is the
product — genuinely useful, instant, and correct. Every page captures a lead:
after showing the estimate it offers a free attorney review.

## Stack
- **Next.js** (App Router) + **TypeScript**, statically generated (SSG).
- **Tailwind** — one shared design system (cal.com-clean / Notion-minimal).
- **Neon** (Postgres, serverless driver) for lead storage via one API route.
- Deploy target: **Cloudflare Pages** (operator-triggered).

## Run locally
```bash
npm install
npm run test    # settlement engine unit tests — must pass
npm run dev     # http://localhost:3000
```

Example page: <http://localhost:3000/personal-injury-settlement-calculator>

> Requires Node.js (18+) and npm. Install from https://nodejs.org if `node` is
> not found.

## Environment
Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` — Neon connection string (leads are logged, not persisted, until
  this is set).
- `LEAD_NOTIFY_EMAIL` — where new-lead notifications go.
- `NEXT_PUBLIC_SITE_URL` — used for canonical tags / sitemap.

Create the leads table once with `docs/neon-schema.sql`.

## How it's organized
- **`AGENTS.md`** — operating rules (mirrored to `CLAUDE.md`, `GEMINI.md`).
- **`directives/`** — SOPs: `build-calculator.md`, `deploy-and-index.md`,
  `design-and-seo.md`.
- **`docs/phase1-spec.md`** — the PI product spec (operator-supplied).
- **`src/lib/settlement.ts`** — the formula, the single source of truth (tested
  in `tests/`).
- **Adding a calculator** = one config in `src/config/calculators/` + one content
  file in `src/content/`. No new engine code. See `directives/build-calculator.md`.

## Guardrails
YMYL topic — the math must pass tests before anything ships. The builder does not
self-approve; a fresh-eyes pass re-verifies. Deployment and any paid action are
operator-triggered. See `AGENTS.md`.
