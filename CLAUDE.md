# AGENTS.md — Operating Rules for Ballpark

> Mirrored to `CLAUDE.md` and `GEMINI.md`. Edit `AGENTS.md` and copy to the others.

## What this is
A hub of free, interactive calculators that rank in Google and convert visitors
into qualified leads sold to law firms (flat per-lead fee, never a percentage of
a case). Niche one: US personal injury settlement estimation. **The calculator is
the product** — it must be genuinely useful, instant, and correct.

**Current phase — traffic first.** We render pure tools + educational content
only. No lead forms, no CTAs, nothing that looks like monetization — for both
Google (search-intent alignment, avoid commercial-thinness signals) and users
(trust). `LeadCaptureForm.tsx` and `/api/leads` stay in the repo but **dormant /
not rendered**. Lead capture is reintroduced one calculator at a time (or
globally) only once pages earn traffic.

## The 3-layer operating model
- **Directives (`directives/`)** — markdown SOPs for repeatable processes. They
  are your instruction set; follow them step by step.
- **Orchestration (you)** — read the directive, do the steps in order, run tests,
  handle errors, ask when unclear.
- **Deterministic code (`src/lib/`, `tests/`)** — the settlement math and
  validation live in tested code. The engine computes; each page only configures.
  Never re-improvise the math per page.

## Rules that matter
1. **Spec first.** Before building any calculator, confirm you have its spec
   (target keyword, inputs, content outline) in `docs/phase1-spec.md`. If unclear,
   ask 3–5 sharp questions and reach high clarity before writing code.
2. **Correctness is non-negotiable.** This is a YMYL (money + legal) topic. The
   math must match the documented formula and pass `npm run test` before any page
   ships. Always output a low-to-high range, never a single number.
3. **Fresh-eyes review.** The builder does not self-approve. A separate review
   pass with clean context checks the page against the spec's acceptance criteria
   and independently re-verifies the math with test inputs.
4. **Small files.** Single-responsibility, aim under ~250 lines, split when they
   grow. Read only the files you need for the current task — keeps context lean.
5. **Reuse before creating.** Check for an existing component/script/helper before
   writing a new one (e.g. `US_STATES`, `withSharedPresets`, `formatUSD`).
6. **Ask before spending.** Anything that costs credits, money, or hits a paid
   API: confirm first. Deployment is operator-triggered only.
7. **Design to the system.** `docs/design/` is the source of truth for look and
   feel — minimalistic, trustworthy, Notion/Cal.com-like. Match
   `design-principles.md` + `design-tokens.md`, compare against the `references/`
   screenshots, and run `ui-review-checklist.md` during the fresh-eyes review.
   Neutral by default; earn every use of color; one primary action per screen.
   **Prefer layouts where the whole tool (inputs + result) fits above the fold**
   whenever possible; keep it compact.
8. **Content style (global).** **Never use em dashes (—) on the pages.** Use
   commas, colons, periods, or parentheses instead. Applies to all page-visible
   copy: headings, body, meta titles/descriptions, option labels, and FAQs.
9. **Keep directives current, but ask first.** Update a directive when you learn
   something useful; ask before overwriting or creating directives.

## Architecture in one paragraph
Next.js (App Router) + TypeScript, statically generated pages (SSG) so crawlers
get clean HTML. The calculation runs client-side and instantly. Tailwind with one
shared design system. Each calculator is **one config file + one content file**
— no new engine code. (Dormant, for later: a single `/api/leads` route writes to
Neon and notifies the operator — not wired into any page during the traffic-first
phase.) Deploy target: Cloudflare Pages (operator-triggered).

## Where things live
- `src/lib/settlement.ts` — the formula (single source of truth) + `tests/`.
- `src/lib/types.ts` — `CalculatorConfig`.
- `src/config/calculators/*.ts` — one config per calculator (+ `index.ts`).
- `src/content/*.mdx` — unique page copy (+ `index.ts` registry).
- `src/components/` — shared UI (`CalculatorForm`, `ResultCard`,
  `LeadCaptureForm`, `FaqSection`).
- `src/app/[calculator]/page.tsx` — renders any calculator from its config.
- `src/app/api/leads/route.ts` — the single lead-capture endpoint.
- `directives/` — the SOPs. `docs/phase1-spec.md` — the product spec.

## Do NOT (until told)
- Do not build calculators beyond the one you were asked for.
- Do not deploy or touch Cloudflare / Google Search Console.
- Do not add analytics, ads, or third-party scripts.
- Do not invent or overwrite directives beyond the three specified without asking.
