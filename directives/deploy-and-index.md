# Directive: Deploy and Index

**Deployment is operator-triggered only.** Do not deploy, touch Cloudflare, or
touch Google Search Console until the operator explicitly says go. Anything that
costs credits or money: confirm first.

## Preconditions (before asking to deploy)
- `npm run test` passes.
- `npm run build` succeeds locally with no type errors.
- The page has passed its fresh-eyes review.
- `DATABASE_URL` and any notification env vars are set in the deploy environment.
- The Neon `leads` table exists (`docs/neon-schema.sql`).

## Build locally first
1. `npm run build` — must succeed cleanly.
2. Spot-check the built pages render and compute correctly.

## On operator go: deploy to Cloudflare Pages
The `@cloudflare/next-on-pages` adapter is already installed and the build is
verified locally (`npm run pages:build` produces `.vercel/output/static`). The
`/api/leads` route runs on the edge runtime; the pages are prerendered.

**Exact Cloudflare Pages project settings** (Workers & Pages > create > Pages >
connect to the GitHub repo):
- Framework preset: Next.js
- Build command: `npx @cloudflare/next-on-pages@1`
- Build output directory: `.vercel/output/static`
- Environment variables:
  - `NODE_VERSION` = `20` (or `22`)
  - `NEXT_PUBLIC_SITE_URL` = the production URL (used by canonical + sitemap)
  - `DATABASE_URL` = Neon URL (optional now; leads log to console until set)
  - `LEAD_NOTIFY_EMAIL` = operator notification target (optional now)
- Compatibility flags: `nodejs_compat` (already in `wrangler.toml`; also set it in
  the Pages project settings for both Production and Preview if the dashboard asks).

After the first deploy, set `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy
so canonical tags and the sitemap use it.

- Verify the deployed URL: pages load, estimate computes, sitemap.xml and
  robots.txt resolve, a test lead POST returns ok.

## Sitemap + indexing
- Generate and submit `sitemap.xml` covering the hub and every calculator.
- In Google Search Console: submit the sitemap and request indexing for new URLs.

## After deploy
- Confirm a real test lead lands in Neon and the operator notification fires.
- Note anything learned back into this directive (ask before overwriting).
