# Tool Idea Backlog

Calculator ideas surfaced from SERP research. When rankings stall on the current
tool, or we want to expand, pull from here. Each idea notes why it looks worth
doing. Add to this file whenever research turns up a new angle.

## Validated by the first SERP (personal injury settlement calculator)

### State-specific settlement calculators  (high priority, lower competition)
Many low-DR pages rank purely by targeting one state, which is far less
competitive than the national term:
- Texas (leahwiselaw.com, fairsettlement.org/states/texas)
- California (feherlawfirm.com, phoonglaw.com, teamjustice.com)
- Florida (porcarolaw.com)
- New Jersey (richardhollawell.com)
- Washington (lehmlaw.com)
- Georgia (jamiecasinoinjuryattorneys.com)
- North Carolina (mehtamcconnell.com)
Our engine already encodes per-state comparative-fault rules, so a state page is
a near-free variant: same tool, state preset locked, state-specific content and
statute-of-limitations notes below. Strong candidate if the national page is slow
to move.

### Payout / "how much will I actually get" calculators  (high intent)
"How much of a $50k / $100k settlement will I get" ranks in People-Also-Ask
(jminjurylawyer.com). A net-payout calculator (gross minus attorney fee minus
liens minus costs) is a distinct, high-intent tool. scheuermanlaw (rank 5) shows
the sophisticated version: gross, minus comparative fault, minus insurance
policy-limit cap, minus attorney fee (default 33.33%) = net recovery. Our engine
already handles fault; adding a fee/lien/policy-limit layer is a natural next
tool.

### Per-diem pain-and-suffering method
An alternative to the multiplier: daily rate x recovery days. scheuermanlaw and
feher offer it as a toggle. Could be its own simple tool or a second method on
the main one.

### State-page blueprint (for the state-specific idea above)
fairsettlement.org/states/texas is the template to beat. Each state page should
include: a stat strip (negligence rule / avg settlement / statute of limitations
/ no-fault yes-no), the fault rule with a worked example, a statute-of-limitations
table with the code citation, damage caps, insurance minimums, city-level average
notes, and named recent verdicts (county + year). Our engine already knows each
state's negligence rule, so the fault section is generated, not guessed.

### Attorney fee calculator
Top keyword for leahwiselaw is "personal injury attorney fee calculator". Simple,
useful, and feeds the payout idea.

### Pain and suffering calculator
Multiple rankers (thepearcelawfirm, vblawgroup, klandrylaw, hellandlawgroup).
Keyword volumes 100 to 1300. It is a sub-component of our current tool, so it can
be spun out as its own focused page.

### Accident-type calculators
Car accident (gunterinjurylaw, porcarolaw, teamjustice), slip and fall
(palermolawyers, blairramirez, vol 800), truck, motorcycle. Higher commercial
intent than the generic term.

### Lawsuit / settlement value calculators
"lawsuit settlement calculator" (scheuermanlaw), "realistic settlement
calculator" (recurring top keyword across many rankers).

## Reverse-engineering shortcut
Standalone tool sites rank with thin word counts but many referring domains.
Drop these into Ahrefs Site Explorer and export every /tool or /calculator URL to
get a near-unlimited idea list:
- setcalc.com
- calculatemycase.com
- legesgpt.com (/tools/)
- fairsettlement.org (/states/)

Keep it simple for now. This is the "if rankings stall" backlog, not the roadmap.
