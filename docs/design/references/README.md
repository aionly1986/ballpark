# Design References

The visual source of truth for Ballpark's look and feel: screenshots of Cal.com,
the product we're deliberately modeling (minimal, trustworthy, Notion-like). When
designing or reviewing any screen, open these and compare — see
`../ui-review-checklist.md`.

## The screenshots

The six reference images (saved here):

| File                      | Shows                                                                 | What to notice |
| ------------------------- | --------------------------------------------------------------------- | -------------- |
| `01-basics.png`           | Event-type **Basics**: grouped sidebar, title/description/URL/duration/location fields, live calendar preview on a muted panel | Grouped nav (Setup / Booking experience / Policies / …); controls-plus-live-preview layout; hairline dividers; near-black text on white |
| `02-booking-form.png`     | **Booking questions**: a list of fields with on/off toggles, `Required`/`Hidden`/`Optional` pill badges, and a live form preview | Progressive disclosure (optional questions toggled off); quiet status pills; black-when-on toggles; one accent-free form |
| `03-confirmation.png`     | **Confirmation** settings + a "This meeting is scheduled" success card | Calm success state: single check, plain What/When/Who/Where summary — no confetti; neutral palette |
| `04-apps.png`             | **Apps** list with `+ Add` buttons and category tags                  | Secondary (bordered) buttons vs primary black `Save`; restrained list rows; generous spacing |
| `05-workflow.png`         | **Workflow** builder: Trigger + Action cards with form fields, `Add variable` | Card-based flow, hairline borders, plain inputs, monochrome except a `Save` button |
| `06-delete-modal.png`     | **Delete workflow** confirmation dialog over a dimmed page            | Modal pattern: centered, compact, white, hairline; a plain-text `Cancel` + a filled **red** destructive button. Red is reserved for destructive/error ONLY |

> These are illustrative references, not assets we ship. Don't copy Cal.com's
> content or branding — we're matching the *design language* (restraint, layout,
> color discipline), not cloning the product.

Cite them directly in reviews, e.g. "compare to `references/02-booking-form.png`".
