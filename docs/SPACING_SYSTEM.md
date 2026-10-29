# Spacing system (homepage)

All vertical rhythm is driven by theme tokens, so it is editable without touching code and works with the draft → publish workflow.

## Tokens (Theme → `spacing`)
| Setting | Values | Generated CSS |
|---|---|---|
| `spacing.section` | compact / **comfortable** / spacious | `--section-y` — comfortable: **88px** desktop (5.5rem), **68px** tablet (<900px), **56px** mobile (<640px); compact 72/56/44; spacious 112/84/68 |
| `spacing.card` | cozy / **comfortable** / roomy | `--card-pad` (comfortable **28px**), `--card-gap` (**24px**) |

Desktop (≥900px) rem values scale with the viewport (1440px = 16px root), so proportions hold at 1280/1024.
Themes published before `spacing.card` existed remain valid (default: comfortable). Existing databases pick up the new rhythm automatically; no content revision is rewritten.

## Section roles (per-type multipliers of `--section-y`, class `sy`)
| Section | top / bottom | 1440px result |
|---|---|---|
| Hero | min-height 38rem, content centred, image 53.5rem wide | 608px tall, 76px nav→eyebrow |
| Credibility strip | 0.5 / 0.5 | 44px |
| Services | 1.0 / 0.8 | 88 / 70px |
| About | 0.8 / 1.0 | 70 / 88px |
| Portfolio | 0.9 / 0.9 | 79px |
| Testimonials | 1.0 / 0.85 | 88 / 75px |
| Call to action | 0.8 / 0.8 | 70px |
| FAQ + contact | 1.0 / 1.0 | 88px |
| Footer | 0.75 top, 52px bottom | 66px top |

## Editing in the Website Editor
* Per-section **Padding** (`styles.paddingY`): Default (role above) · None · Small (0.5×) · Medium (0.75×) · Large (1×) · Extra large (1.35×) — all scale with `--section-y`.
* Appearance Manager → Spacing: section rhythm and card spacing.

## Layout
Container = `max-w-7xl` (80rem) with gutters 20px phones (px-5), 24px tablets (px-6), 28px desktop — identical 76.5rem content width to the approved design.
