# Directive: Build a Calculator

An SOP for adding one new calculator page. Follow the steps in order. One
calculator at a time, on the operator's instruction.

## 1. Confirm the spec + do the research (spec first)
- Open `docs/phase1-spec.md` and locate this calculator's section.
- You need: target keyword, slug, H1, meta, the input labels/presets, the content
  outline, and acceptance criteria.
- **Store the Ahrefs data** the operator provides and **scrape the top ~20 ranking
  results** before building. Follow `docs/research/README.md`: append to
  `data/keywords.csv`, save the SERP snapshot to `data/serp/<slug>.csv`, log
  competitors in `data/competitors.csv`, write the scrape synthesis to
  `docs/research/<slug>.md`, and add any new ideas to `docs/research/tool-ideas.md`.
- Use the scrape to decide inputs and content. **Get the input balance right**:
  enough to be genuinely useful, not so many the user bounces. If a top ranker
  looks bad, do NOT copy it. Use judgment and build it better.
- If anything is unclear or missing, STOP and ask 3–5 sharp questions. Reach high
  clarity before writing any code. Do not guess on a YMYL money/legal topic.

## 2. Create the config
- Add `src/config/calculators/<slug>.ts` exporting a `CalculatorConfig`.
- Reuse `US_STATES` and `withSharedPresets` — do not redefine shared options.
- Register it in `src/config/calculators/index.ts` (one line).
- Do NOT add engine code. If the math genuinely needs to change, that is a
  separate, tested change to `src/lib/settlement.ts` + `tests/` — never a
  per-page tweak.

## 3. Add unique content (800–1500 words)
- Create `src/content/<contentPath>.mdx` and register it in
  `src/content/index.ts`.
- Cover: how this settlement type is calculated, a worked example, what affects
  it, state notes, and 5–6 FAQs.
- Content must be unique to this page — no boilerplate shared across calculators.
- Put the FAQs in the config's `faqs` array so they render on-page AND emit FAQ
  schema.
- **Highlighted number examples (required).** No filler below the tool. Add worked
  examples to the config's `examples` array; they render in the highlighted
  `ExampleEstimates` panel and are computed by the tested engine, so the numbers
  are always correct. This is the content pattern that ranks (see
  `docs/research/personal-injury-settlement-calculator.md`). Only cite external
  averages if you have a real source; never invent them.

## 4. Wire the nine inputs
- accident type, state, medical bills, future medical, lost wages, injury
  severity, fault level, date of accident, already have a lawyer.
- The config drives all of them; `CalculatorForm` already renders from config.
  Only five feed the math; the rest qualify the lead.

## 5. Lead capture with consent
- `LeadCaptureForm` is already wired to `/api/leads`. Confirm the estimate
  context is passed so the lead arrives qualified.
- The TCPA consent checkbox must NOT be pre-ticked. Consent wording is an
  operator-supplied, lawyer-reviewed TODO — do not invent legal text.

## 6. Run the settlement tests (correctness is non-negotiable)
- `npm run test` must pass before the page ships. If the formula changed, the
  tests must be updated and re-verified first.

## 7. Fresh-eyes review (builder does not self-approve)
- Run a separate review pass with clean context. It must:
  - Check the page against the spec's acceptance criteria.
  - Independently re-verify the math with its own test inputs (hand-compute,
    compare to the on-page result).
  - Confirm unique content, working capture, consent not pre-ticked, FAQ schema
    present, interlinking to the hub.
  - Run `docs/design/ui-review-checklist.md` against the page with the reference
    screenshots open. It must look like the same product as the rest.

## 8. Verify locally
- `npm run dev`, load the page, confirm: instant result range, correct numbers,
  capture works, mobile layout is clean, content renders.
- Do NOT deploy. Deployment is operator-triggered (`deploy-and-index.md`).

## Keep the directive current
When you learn a useful edge case or a better step, update this file — but ask
the operator before overwriting or restructuring it.
