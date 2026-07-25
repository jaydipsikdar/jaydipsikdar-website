# Jaydip Sikdar — Design System

> A calm, editorial interface system built on midnight-blue ink, vivid ember-orange actions, and an original atmospheric color field. Professional, warm, energetic. Quiet surfaces that let one saturated accent do the pointing.

---

## 1. Brief

**Who:** Jaydip Sikdar — Fractional CMO, B2B marketing consultant, content creator, podcast host.

**What this system covers:** Personal brand identity across web properties, marketing pages, dashboards, presentations, and content assets. Two contexts share this system: the consulting/startup work and the creator brand (LinkedIn, YouTube, Instagram, The Marketing Couch podcast).

**Positioning:** Open white content canvas paired with a broad, custom atmospheric color field. Deep ink anchors body copy and product surfaces. Ember orange is reserved strictly for actions and inline emphasis. Product mockups float above the canvas; cool-white and cream bands separate sections.

**Personality:** Warm but efficient. Expert without being cold. The design should feel like someone who knows what they're talking about and respects your time.

---

## 2. Color Palette

### Primary / Action
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#e84500` | Filled CTAs, inline emphasis. ONE filled button per content band. |
| `--color-primary-hover` | `#cc3a07` | Hover state for primary actions |
| `--color-primary-press` | `#9e2c04` | Pressed state. No scale/shrink on press; color shift carries the feedback. |
| `--color-primary-soft` | `#f97a3d` | Product accents, chart highlights |
| `--color-primary-subtle` | `#ffd8c4` | Subtle peach tag fill, hover background wash |

### Ink / Text
| Token | Hex | Usage |
|---|---|---|
| `--ink-900` | `#13233d` | Default body text |
| `--ink-700` | `#34465d` | Secondary text |
| `--ink-500` | `#6d7d91` | Muted text, placeholders |

### Surfaces
| Token | Hex | Usage |
|---|---|---|
| `--white` | `#ffffff` | Canvas background |
| `--surface-soft` | `#f6f9fc` | Cool-white feature bands |
| `--surface-cream` | `#f7eddc` | Warm interludes between content sections |
| `--surface-dark` | `#19233b` | Dark product chrome, featured pricing tier |

### Borders
| Token | Hex | Usage |
|---|---|---|
| `--hairline` | `#e0e7ef` | 1px card and table borders |
| `--hairline-input` | `#adc0d7` | 1px form field borders (darker so inputs read as interactive) |

### Data / Color Field Accents (never action fills)
| Token | Hex | Usage |
|---|---|---|
| `--rose-500` | `#df4770` | Data viz, color field gradient stops |
| `--pink-400` | `#ef7bc2` | Data viz, color field gradient stops |
| `--ochre-600` | `#b57738` | Data viz, color field gradient stops |

### Shadow Base
| Token | Value |
|---|---|
| `--shadow-1` | `rgba(21,59,101,0.08) 0 1px 3px` — card lift on white |
| `--shadow-2` | `rgba(21,59,101,0.08) 0 8px 24px, rgba(21,59,101,0.04) 0 2px 6px` — floating panels |
| `--ring-primary` | `0 0 0 3px` at primary 28% alpha — focus ring |

**Color vibe in one sentence:** Two temperatures held in balance. A cool spine (white canvas, cool-white bands, midnight ink, blue-tinted shadows) warmed by a cream interlude and the color field's ochre/rose/pink. Ember orange is the single energetic note, rationed hard.

---

## 3. Typography

**One family: Inter** (Google Fonts, SIL OFL). System-UI fallback.

### The brand fingerprint
Display text lives at **weight 300** with tight negative tracking. This lightness is the identity. Never bold display text. Never exceed weight 300 for display.

### OpenType features
- `font-feature-settings: "ss01" 1` — applied globally (alternate glyphs)
- `font-feature-settings: "tnum" 1, "ss01" 1` — on every numeric run (tabular figures)

### Type Scale

| Role | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|
| Display XXL | 56px | 300 | −1.4px | 1.03 |
| Display XL | 48px | 300 | −0.96px | 1.15 |
| Display LG | 32px | 300 | −0.64px | 1.1 |
| Display MD | 26px | 300 | −0.26px | 1.12 |
| Heading LG | 22px | 300 | −0.22px | 1.1 |
| Heading MD | 20px | 300 | −0.2px | 1.4 |
| Heading SM | 18px | 300 | — | 1.4 |
| Body LG | 16px | 300 | — | 1.4 |
| Body MD | 15px | 300 | — | 1.4 |
| Body Tabular | 14px | 300 | −0.42px | 1.4 |
| Button MD | 16px | 400 | — | 1 |
| Button SM | 14px | 400 | — | 1 |
| Caption | 13px | 400 | −0.39px | 1.4 |
| Micro | 11px | 300 | — | 1.4 |
| Micro Cap (eyebrow) | 10px | 400 | 0.1px | 1.15 |

**Weight rule:** 300 for display, heading, and body. Step up to 400 for buttons, captions, and eyebrows (legibility at small size).

---

## 4. Spacing

**8px base grid** with 2 / 4 / 12px sub-tokens.

| Token | Value | Usage |
|---|---|---|
| `--space-xxs` | 2px | Hairline adjustments |
| `--space-xs` | 4px | Tight internal gaps |
| `--space-sm` | 8px | Base unit |
| `--space-md` | 12px | Sub-base |
| `--space-lg` | 16px | Standard gaps |
| `--space-xl` | 24px | Component internal spacing |
| `--space-xxl` | 32px | Card padding (feature/pricing) |
| `--space-huge` | 64px | Section spacing start |

### Section rhythm
- Marketing sections: **64–96px** vertical padding, gaps tending to 96px
- Product surfaces: **32–48px** vertical padding
- Content container: **~1200px** max-width
- Color field: **edge-to-edge**, extends beyond container
- Card padding: **32px** for feature/pricing, **24px** for product mockups
- Pricing grid: 4-up → 2-up → 1-up at 1024px / 768px breakpoints

---

## 5. Corner Radii

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 4px | Tags, table chrome |
| `--radius-sm` | 6px | Form inputs |
| `--radius-md` | 8px | Compact cards, alerts |
| `--radius-lg` | 12px | Feature and pricing cards |
| `--radius-xl` | 16px | Product mockup chrome |
| `--radius-pill` | 9999px | **All buttons and tag pills** |

**Hard rule:** Actions are always pills (9999px). Never rounded rectangles for buttons. This is non-negotiable.

---

## 6. Components

### Button
- **Variants:** `primary` (ember fill, white label) · `secondary` (canvas fill, ember text, 1px ember border) · `on-dark` (Night 900 fill, white label)
- **Sizes:** `md` (40px height, 8px 16px padding) · `sm` (34px height, 6px 14px padding)
- **Geometry is fixed.** Never shrink primary padding below 8px 16px.
- **Labels:** Sentence case, 1–2 words, verb-first ("Start free," "View pricing")
- **Icons:** Lucide at `stroke-width: 1.5`, ~18px. Color inherits `currentColor`.
- **States:** Hover → deeper ember. Press → `#9e2c04` (color shift, no scale/shrink). Focus → 3px ember ring at 28% alpha.
- **Mobile:** Hit target 40×40 minimum, up to 44×44.

### Card
- **Tones:** `light` (canvas + hairline, default) · `cream` (`#f7eddc`) · `dark` (Night 900, white text)
- **Shape:** 12px radius, 32px padding, 1px hairline border. A card is defined by its border and padding more than by shadow.
- **Elevation:** 0 (flat) · 1 (lift) · 2 (floating). Interactive cards lift 1→2 on hover, 150ms.
- **Featured/pricing cards invert** to Night 900 with white text.

### NavBar
- Wordmark as type (no logo mark exists). Centered links. Sign-in link + primary CTA pill.
- `transparent` mode to float over the ColorField. `scrolled` mode for translucent-blur treatment on scroll.

### Footer
- Standard marketing footer with link groups and Lucide social icons.

### PricingCard
- One `featured` tier (inverts to Night 900) per pricing grid. Featured tier gets the filled primary CTA; non-featured tiers get secondary (outlined).
- Price uses tabular figures automatically. Keep features to 3–6 rows.

### ColorField (atmospheric background)
- The signature layered gradient: cream → ochre → peach → ember → rose → pink. Blurred radial forms in CSS.
- **Author a fresh field per project. Never copy or trace an external backdrop.**

### PillTag
- Small tag with pill radius, used for categories and metadata. Uses `--radius-pill`.

### Stat
- Tabular-figure data display for metrics. Always uses `tnum` feature setting.

### TextInput
- 6px radius, 1px `--hairline-input` border. Standard form field.

### TextLink
- Ember color by default. Hover → deeper ember. No underline by default.

---

## 7. Content & Voice

### Hard rules (scan before anything ships)
- **No em dashes.** Use commas, colons, periods, hyphens, or parentheses.
- **No AI-giveaway phrases:** cut "unleash," "game-changing," "dive into," "straightforward," "unlock," "it's worth noting," "at the end of the day," and contrast crutches like "X doesn't just do Y, it does Z."
- **No corporate jargon:** no "synergize," "leverage," "circle back," "touch base."
- **Never bury the lede.** Key point first, supporting detail after.
- **Write for the ear.** If it reads like documentation, rewrite until it sounds natural said aloud.
- **No unearned superlatives:** skip "best," "only," "first," "revolutionary" unless the claim is provable.

### Voice
- Warm but efficient. Open friendly, then get to the point. State the cost, the limit, or the bad news plainly.
- **Parentheticals are the signature move** (2–4 in a content-forward piece, for edge or humor, never filler).
- Strikethrough carries the occasional unfiltered thought, about once per piece.
- Emoji: sparse, only for navigation aid. Never in formal docs.
- Second person for marketing ("Everything your team ships, in one calm surface"). Avoid "I."

### Interface copy
- Headlines state the insight, not the topic, in one takeaway under 15 words.
- Buttons are verb-first, 1–2 words. Never Title Case.
- Eyebrows: 1–3 words in all-caps micro-cap style (the only uppercase in the system).
- Numbers: exact, tabular (`$1,240.00`, `14,208`).
- **Sentence case everywhere except the eyebrow.**

### Tone examples
- Hero: "A calmer place for the work that ships."
- Sub: "Plan, review, and release from one surface. Stays out of the way (no tab-hopping, no lost context)."
- Empty state: "Nothing here yet. Create your first project to begin."
- Error: "That didn't send. Check your connection and try again."
- CTA pair: primary "Start free", secondary "Watch demo."

---

## 8. Layout Patterns

### Backgrounds
- Atmospheric color field in the upper third of marketing heroes, full-bleed.
- Cool-white (`--surface-soft`) and cream (`--surface-cream`) bands separate explanatory sections.
- Max 1–2 background colors per page beyond white.
- No repeating patterns, no textures, no photographic hero backgrounds.

### Imagery
- Product UI mockups first. Multi-panel arrangements (editor + table + chart) at small scale in 16px-radius containers on white.
- If photography is unavoidable: 4:3 inset, no shadow, warm-neutral grade.

### Motion
- Quiet and quick. 120–180ms, `ease` / `ease-out`. Opacity fades and small (4px max) translate/lift.
- No bounce, no spring, no long or showy transitions. Motion confirms; it never performs.

### Transparency & blur
- Reserved for the color field (soft blurred forms) and an optional translucent sticky nav (canvas at ~85% + backdrop-blur on scroll). Elsewhere, surfaces are opaque.

---

## 9. Do's and Don'ts

### Do
- Reserve ember orange for filled CTAs and inline emphasis (one filled button per band)
- Keep display type at weight 300 with its negative tracking
- Use `tnum` for all data and numeric displays
- Use pill geometry `8px 16px` fixed for all buttons
- Pair features with product mockups
- Author an original color field per project
- Use Lucide icons at `stroke-width: 1.5`, never filled
- Use sentence case everywhere except eyebrows

### Don't
- Bold display text or go above weight 300 for display
- Shrink primary button padding below 8px 16px
- Use ember orange as body text color
- Substitute rounded rectangles for pill buttons
- Use emoji as icons or in formal contexts
- Use rose, pink, or ochre as action fills (they're for data viz and color field only)
- Reproduce third-party brand colors, logos, screenshots, or backdrops
- Use drop shadows for marketing depth (use color field for that)

---

## 10. Iconography

**Lucide** (open-source, ISC license). Loaded from CDN or `lucide-react`.

- `stroke-width: 1.5` — keeps the light register matching Inter 300
- Never fill icons. Never mix icon families.
- Sizing: 16px inline with body, 20px in nav/buttons, 24px for feature marks
- Color inherits `currentColor`. Ember orange only when the icon is the action itself.

---

## 11. CSS Token Reference (copy-paste ready)

```css
:root {
  /* --- Colors --- */
  --color-primary:         #e84500;
  --color-primary-hover:   #cc3a07;
  --color-primary-press:   #9e2c04;
  --color-primary-soft:    #f97a3d;
  --color-primary-subtle:  #ffd8c4;
  --color-on-primary:      #ffffff;

  --surface-canvas: #ffffff;
  --surface-soft:   #f6f9fc;
  --surface-cream:  #f7eddc;
  --surface-dark:   #19233b;

  --text-body:      #13233d;
  --text-secondary: #34465d;
  --text-muted:     #6d7d91;
  --text-on-dark:   #ffffff;

  --border-hairline: #e0e7ef;
  --border-input:    #adc0d7;

  --accent-rose:  #df4770;
  --accent-pink:  #ef7bc2;
  --accent-ochre: #b57738;

  /* --- Typography --- */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --weight-light:   300;
  --weight-regular: 400;

  /* --- Spacing (8px base) --- */
  --space-xxs: 2px;  --space-xs: 4px;   --space-sm: 8px;
  --space-md: 12px;  --space-lg: 16px;  --space-xl: 24px;
  --space-xxl: 32px; --space-huge: 64px;
  --container-max: 1200px;

  /* --- Radius --- */
  --radius-xs: 4px;  --radius-sm: 6px;  --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px; --radius-pill: 9999px;

  /* --- Elevation --- */
  --shadow-1: rgba(21,59,101,0.08) 0 1px 3px;
  --shadow-2: rgba(21,59,101,0.08) 0 8px 24px, rgba(21,59,101,0.04) 0 2px 6px;
  --ring-primary: 0 0 0 3px rgba(232,69,0,0.28);
}
```

---

## Usage Notes for AI Agents

**Claude Code / Cowork / Claude Chat:** When building any UI, artifact, component, or visual asset for Jaydip Sikdar, read this file first and apply all tokens and rules. Do not invent new colors. Do not substitute fonts. Do not use rounded-rectangle buttons. The atmospheric color field must be authored fresh each time, never reused from another project.

**Priority order when rules conflict:** Voice rules (Section 7) > Color rationing rules (Section 2) > Component specs (Section 6) > Layout patterns (Section 8).
