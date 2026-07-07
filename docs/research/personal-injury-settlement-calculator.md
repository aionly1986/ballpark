# SERP Synthesis: personal injury settlement calculator

Scraped the top-ranking tools on 2026-07-07 (see `data/serp/…csv` for the metrics
snapshot). 11 pages profiled. This is what wins, and what we do about it.

## What every ranking tool does the same
- **Multiplier method.** Economic damages (medical + future medical + lost wages
  + sometimes property damage/future income) times a 1.5–5 pain-and-suffering
  multiplier, then adjusted for fault. Our engine already implements exactly
  this, so we match the accepted method.
- **Shows a breakdown, not just one number.** shookandstone (component bars),
  lehmlaw (economic / non-economic / total). Our ResultCard already does this.
- **Pads the page with SEO depth below the tool**: damage types, how the formula
  works, factors, averages, FAQs.

## The big opportunities (where rankers are weak)
1. **Number examples, done right.** This is the strongest content pattern and the
   one the operator wants. Competitors show worked math and averages, but often
   messy or uncited:
   - calculatemycase: "average $445,408, median $48,855" (Thomson Reuters,
     ~9,500 cases 2019–2024); per-accident-type tables; named case examples.
   - setcalc: "insurance offered $12k, we got $85k"; whiplash avg $18,950 (range
     $7,500–$50,000); NY avg $287k vs national $30,416.
   - gunterinjurylaw: "($10,000 + $5,000 + $2,000) x 3 = $51,000" then "+ $15,000
     = $66,000".
   - feherlawfirm: "$50,000 economic x 3 = $150,000 non-economic = $200,000".
   - Our move: a **highlighted worked-examples panel** using our own tested
     engine, so the numbers are always correct and transparent. Ship this.
   - (Sourced averages like the Thomson Reuters figure can be added later ONLY
     with a real citation. Do not invent averages.)
2. **Ungated + "no email" trust hook.** conduit.law leads with "Free, instant,
   no email required." setcalc hides the estimate behind an attorney call (their
   weakness). Our no-capture phase is exactly right; make the trust promise
   explicit on the page.
3. **Comparative-fault depth.** gunterinjurylaw ranks with deep pure/modified/
   contributory state content. We already encode this per state in the engine, so
   our state note + state-notes content is a genuine, defensible strength. Lean in.
4. **Clean design.** Most are dated law-firm templates (3–4/5). setcalc and
   conduit are the cleanest. Our Cal-clean monochrome page should beat the field.
   Do NOT copy the cluttered ones.

## Input comparison (balance check)
Common inputs: medical expenses, future medical, lost wages, future lost income,
property damage, pain-and-suffering multiplier (or severity), fault %, accident
type, injury type. Some split "to date" vs "future" per category (feels rigorous
but adds fields).

Our set (accident type, state, medical bills, future medical, lost wages,
severity, fault, date) is balanced: fewer fields than the rigorous ones, and we
use a friendly **severity dropdown** instead of asking users to pick a raw 1.5–5
multiplier. Keep it. Property damage / future lost income are possible optional
additions later if we want more precision, but not worth the extra friction now.

## Applied to our page (this round)
- Add a highlighted **Example estimates** panel below the tool (3 worked
  scenarios from our engine: minor / moderate / severe).
- Add an explicit **Free, instant, no email** trust line.
- Keep the comparative-fault content and the live per-state note.
- H1, meta title, meta description already in place; keep them tuned to the term.

## Round 2 additions (ranks 5, 6, 8, 13, 14, 16, 17, 18)
- **Net-payout modeling wins on sophistication.** scheuermanlaw (rank 5, the
  cleanest tool at 5/5) computes a realistic NET figure: gross, minus comparative
  fault, minus insurance policy-limit cap, minus attorney fee (default 33.33%).
  It also toggles multiplier vs per-diem. Strong future feature/tool (see ideas).
- **State-page blueprint confirmed.** fairsettlement.org/states/texas leads with
  a stat strip (negligence law / avg settlement / statute of limitations /
  no-fault), a SoL table with a statute citation, damage caps, insurance
  minimums, city-level averages, and named county verdicts. This is the template
  for our state pages.
- **Gating is the weak play.** kermanillp (rank 14) and goodnowmckay (rank 18)
  hide the result behind name/email/phone and email it to you. Worse UX than the
  ungated majority. Reinforces our instant, no-email approach.
- **Severity as plain-language, not a raw multiplier.** leahwiselaw and
  sallymorin let users pick life-impact statements or preset buttons instead of a
  1.5–5 number. We already do this with our severity dropdown.
- dubolawfirm (rank 8) blocks scraping; profile by hand later if needed.

## Competitor / idea signals (logged)
- Standalone tool sites (setcalc.com, calculatemycase.com, legesgpt.com/tools,
  fairsettlement.org/states) run the same tool strategy at scale. Logged in
  `data/competitors.csv` to reverse-engineer in Ahrefs later.
- State-specific pages rank with low DR = validated expansion path (see
  `tool-ideas.md`). Our engine's per-state rules make this near-free.
