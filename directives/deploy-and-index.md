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
- Next.js App Router on Cloudflare Pages uses the `@cloudflare/next-on-pages`
  adapter (the `/api/leads` route runs on the edge runtime — already set).
- Configure the build command and output per the adapter's docs.
- Set environment variables (`DATABASE_URL`, `LEAD_NOTIFY_EMAIL`,
  `NEXT_PUBLIC_SITE_URL`) in the Cloudflare project.
- Verify the deployed URL: pages load, estimate computes, a test lead submits.

## Sitemap + indexing
- Generate and submit `sitemap.xml` covering the hub and every calculator.
- In Google Search Console: submit the sitemap and request indexing for new URLs.

## After deploy
- Confirm a real test lead lands in Neon and the operator notification fires.
- Note anything learned back into this directive (ask before overwriting).
