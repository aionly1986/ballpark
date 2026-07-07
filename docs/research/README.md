# Research and Keyword Database

Every tool starts from a keyword and its SERP. This folder plus `/data` is where
we keep what we learn, so we always know our numbers and never build blind.

## The workflow (per new tool)
1. **Operator provides** the target keyword and an Ahrefs keyword/SERP overview
   (CSV export).
2. **Store the data** (this is a standing rule, do it every time):
   - Append a row to `data/keywords.csv` (KD, volume, traffic potential, CPS,
     CPC, parent topic, intents, status, our URL).
   - Save the SERP snapshot to `data/serp/<slug>.csv` (rank, domain, URL, page
     type, DR/UR, backlinks, referring domains, words, traffic, value, title).
   - Add any recurring or standalone tool-strategy domains to
     `data/competitors.csv`.
3. **Scrape the top ~20 ranking results** (prioritize higher ranks and the actual
   tools). For each, capture: the exact input fields, whether results are gated
   behind a form, the content structure below the tool, whether they show
   concrete dollar example scenarios, and a design-quality judgment. Write the
   synthesis to `docs/research/<slug>.md`.
4. **Apply the lessons** to our page:
   - Match or beat the useful inputs, but keep them balanced (enough to be
     valuable, not so many the user bounces).
   - If a top ranker looks bad, do NOT copy it. Use judgment and build it better.
   - Below the tool, put **useful, specific content, especially worked number
     examples**, never filler. See the content rule below.
5. **Log ideas** in `tool-ideas.md` (new tool angles, state variants, competitor
   tools to reverse-engineer).
6. **SEO essentials** on every page: H1, meta title, meta description, unique
   content, FAQ schema, interlinking.

## The content-below-the-tool rule
No random filler. The section under the tool should be genuinely useful, and it
should lead with **concrete number examples** (worked scenarios with real dollar
figures), which is what several rankers do well. These examples must be
**visually highlighted** (their own panel / background), not just a wall of text.
Numbers come from our own tested engine so they are always correct.

## Why we store all this
So we can later build a dashboard/database over `data/` to track every keyword,
every tool, our ranking/performance, and where a few backlinks to a high
traffic-potential tool would pay off. For now we just collect it.

## Files
- `data/keywords.csv` — the global keyword database (one row per target).
- `data/serp/<slug>.csv` — SERP snapshot per keyword.
- `data/competitors.csv` — domains worth reverse-engineering in Ahrefs.
- `docs/research/<slug>.md` — per-keyword scrape synthesis.
- `docs/research/tool-ideas.md` — the idea backlog.
