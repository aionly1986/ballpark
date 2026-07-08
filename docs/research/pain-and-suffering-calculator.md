# SERP Synthesis: pain and suffering calculator

Scraped the top rankers on 2026-07-08 (metrics in `data/serp/…csv`). KD 3 (very
easy), volume 1,200, traffic potential 2,200. Operator flagged scheuermanlaw and
setcalc.com/guides as the best content examples.

## The winning content pattern (what we combined)
The best pages share a skeleton; the two best each win on one axis:
- **setcalc.com/guides** wins on **worked examples**: a "real scenarios" block with
  line-by-line math (named injury + state, economic -> multiplier -> total). This
  is the single most human, most persuasive element.
- **scheuermanlaw** wins on **table breadth**: 7 tables (severity->multiplier,
  per-diem rates, average by injury type, by accident type, damage caps, tax
  treatment, settlement timeline), each with a consistent "category -> range ->
  factors" schema.
- **millerandzois / thepearcelawfirm** add a recurring worked-example persona and
  question-as-heading structure that captures long-tail queries.

Our build combines setcalc's line-by-line worked examples with scheuerman's core
tables, using OUR engine's numbers so every figure is correct.

## What we built
- New tool at `/pain-and-suffering-calculator` (config + content, no new engine
  code beyond a fault-adjusted pain-and-suffering range added to the result).
- The result **leads with the pain-and-suffering range** (new `resultEmphasis`
  flag), matching the keyword intent. Total settlement + economic shown as
  secondary. This mirrors munley / thepearcelawfirm, which output a "Potential
  Pain & Suffering Range."
- Content below the tool: multiplier table, per-diem table, average-by-injury
  table, four worked examples (engine-computed), state fault-rules table,
  raises/lowers table, an insurance-lowball comparison, and a documentation
  checklist. GFM tables now render (added remark-gfm) and are styled Cal-clean.

## Deliberate scope calls
- **Multiplier method only in the interactive tool** (per-diem is taught in the
  content with a table + explanation, not built into the tool). Matches munley /
  pearce, keeps the tool lean.
- **No dated damage-cap dollar tables.** scheuerman lists exact Maryland caps by
  date; those go stale and are easy to get wrong. We note caps exist (esp. med
  mal) without inventing figures. Add real, cited caps later if we build state
  pages.
- Averages-by-injury framed as "rough ranges, not promises" (consistent with
  setcalc/scheuerman, which agree closely).

## Competitor / idea signals (logged)
- Insurer-specific variants rank and are thin: "Progressive pain and suffering
  calculator" (braunslaw, houlonberman), "State Farm pain and suffering
  calculator" (youtube). Low-competition spin-off pages.
- State variants: California (weinberglawoffices, lawlinq, feher), Texas
  (patricktoscano, sanantonioaccidentlawyer), Georgia (braunslaw), South Carolina
  (chappell.law), Arizona (impact-legal). Validates state pages again.
- painworth.com and calculatemycase.com and fairsettlement.org reappear as
  standalone tool networks (already in `data/competitors.csv`).
- Per-diem method + "insurance vs you" comparison are strong differentiators worth
  reusing on future tools.
