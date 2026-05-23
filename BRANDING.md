# Serenvi — Brand & Design System

**One-file source of truth.** Read before touching UI.

> Aesthetic: **Editorial Bazaar** — warm, ink-on-ivory, serif-led, refined.
> Inspired by the structural clarity of Indian fashion e-commerce (ajio,
> nykaa) but deliberately *not* the pink/white/purple-gradient clichés.

---

## 1. Voice & positioning

- **Name**: Serenvi (_seh-REN-vee_).
- **Tagline**: "Modern · Indian · Bazaar" (set in caps, tracked out).
- **Voice**: editorial, understated, confident. Fraunces-serif headlines
  feel like a fashion magazine; body copy is plain, specific, human.
- **What we never do**: neon gradients, purple-on-white, "🚀 Premium
  products for your lifestyle", emoji-as-logo, sentence-case everywhere.
- **What we do**: italicised serif emphasis, tracked-out eyebrow labels,
  saffron as the single bright accent, generous whitespace, ink hairlines.

---

## 2. Logo

Assets (committed in `frontend/public/`):

| File                     | Use                                       |
|--------------------------|-------------------------------------------|
| `logo.svg`               | Horizontal wordmark (web headers)         |
| `mark.svg`               | 96×96 standalone mark (cards, social)     |
| `favicon.svg`            | Browser tab (SVG, scales down cleanly)    |
| `apple-touch-icon.svg`   | iOS home-screen, 180×180 rounded square   |

Inline React: `src/components/Common/Logo.tsx` — renders at whatever size
you give it and tracks `currentColor` for the square.

**Construction**: black rounded square (14px radius on wordmark, 18px on
mark) carrying a teardrop/leaf outline in ivory, bisected by a saffron
sprout line with a seed dot on top. Wordmark set in Fraunces 500 with
letter-spacing 6. Subtitle in Instrument Sans 500, tracking 7.

**Clearspace**: minimum padding around the mark = 1/4 of the mark's
height on every side. Do not recolour the mark, stretch, or add
drop-shadows. On ink backgrounds use `text-ivory`; on ivory/paper use
`text-ink`.

---

## 3. Palette

All tokens live in **two mirrored places**:
`frontend/tailwind.config.js → theme.extend.colors` and
`frontend/src/index.css → :root`.

| Token       | Hex       | Role                                                |
|-------------|-----------|-----------------------------------------------------|
| `ivory`     | `#F6F1E8` | Page background                                     |
| `paper`     | `#FFFFFF` | Cards, inputs                                       |
| `stone`     | `#E9E1D3` | Chip fills, skeletons                               |
| `sand`      | `#EFE7D6` | Soft blocks, image placeholders                     |
| `ink`       | `#0E0D0B` | Primary text, dark surfaces, primary CTA            |
| `soot`      | `#1C1A16` | Ink gradient deepest stop                           |
| `ash`       | `#8A8275` | Muted text, meta info                               |
| `mist`      | `#BDB3A0` | Subtle text on ink                                  |
| `saffron`   | `#D4542A` | **Sole bright accent.** Used sparingly             |
| `ember`     | `#B8431C` | Saffron hover / depth                               |
| `ochre`     | `#C08A2E` | Secondary accent (badges, ticks)                    |
| `moss`      | `#3E5240` | Success / tertiary                                  |
| `rose`      | `#C24B5B` | Destructive, sale flags                             |

**60-30-10 rule**: ivory 60%, ink 30%, saffron ≤10%. If saffron ever
feels dominant, remove it from somewhere.

Legacy tailwind aliases (`primary`, `secondary`, `accent`) are mapped to
saffron/moss/ochre so older class usage keeps working.

---

## 4. Typography

Fonts loaded via Google Fonts in `public/index.html`:

| Role      | Family             | Weights        | Fallback                                |
|-----------|--------------------|----------------|-----------------------------------------|
| Display   | **Fraunces**       | 300–800, opsz  | Playfair Display, Georgia, serif        |
| UI / Body | **Instrument Sans**| 400–700        | Helvetica Neue, system-ui, sans-serif   |
| Mono      | **JetBrains Mono** | 400–500        | ui-monospace, monospace                 |

- All `h1`–`h4` and `.font-display` use Fraunces, letter-spacing -0.015em,
  `font-variation-settings: 'SOFT' 30, 'WONK' 0` (warm, not quirky).
- Italic emphasis inside display headings is a signature move
  (`<em class="not-italic text-saffron" style="font-style: italic">`).
- Eyebrow labels: `.eyebrow` → 0.72rem, uppercase, tracking 0.18em, ash.
- Body copy: Instrument Sans, 16px, `text-pretty` where wrapping matters.
- Mono is reserved for numeric chips ("LIVE · 706 SKUs"), size pills,
  GSTIN / country info — nothing long.

Custom scale on Tailwind (`fontSize`):
`eyebrow`, `display-sm` (2.1rem), `display` (3.2rem),
`display-lg` (4.6rem), `display-xl` (6.4rem).

---

## 5. Space, rhythm, shape

- Spacing: Tailwind defaults; pages use `space-y-6` / `space-y-10` at
  section level.
- Radius: **`rounded-pebble`** (14px) is the house curve. Images use
  `rounded-md` inside cards. Icons inside pills keep `rounded-full`.
- Rules: `border-ink/10` for whisper, `border-ink/15` for inputs,
  `border-ink/25` on hover of cards. Avoid thicker strokes.
- Shadows: **`shadow-card`** at rest, **`shadow-lift`** on hover.
  No glow shadows (no `shadow-*/50`). The old cyan glow is dead.
- Grid: `max-w-7xl` content, `px-4 md:px-8` side padding, 12-col grid
  where needed.

---

## 6. Components (in `src/index.css` @layer components)

- `.btn-primary`    — ink filled, ivory text, hover → saffron
- `.btn-secondary`  — paper, ink border, hover → solid ink border
- `.btn-ghost`      — text only, subtle ink/5 hover bg
- `.btn-saffron`    — saffron filled, ivory text (for "Buy now", hero CTAs)
- `.btn-sm`         — compact variant
- `.input-field`    — standard form field
- `.card`           — paper + ink/10 border + `shadow-card`
- `.chip`, `.chip-active` — filter pills
- `.product-card`   — shop grid card (pairs with `.product-media`)
- `.skeleton`       — shimmer loading
- `.eyebrow`        — small caps label
- `.rule`           — hairline separator

Utilities: `.bg-editorial`, `.bg-grain`, `.text-balance`, `.text-pretty`,
`.scrollbar-hidden`, `.marquee-track`.

---

## 7. Motion

- Page sections: `animate-fade-up` (opacity + 8px rise, 500ms ease-out).
- Product tiles: staggered `fadeUp` with 20ms offsets (first 12 only).
- Product images: scale 1.05 on card hover (700ms ease-out).
- Marquees: top announcement and footer ticker, 40s linear infinite.
- Skeletons: 1.6s linear shimmer.
- **Never** bounce, spin, or rubber-band. Motion is editorial pacing,
  not kinetic typography.

---

## 8. Layout primitives

- **`components/Common/Layout.tsx`** — ticker, masthead (logo, search,
  cart, user), primary category nav, mobile drawer, footer slot.
- **`components/Common/Footer.tsx`** — ticker, 4-column info, newsletter,
  socials, legal line.
- **`components/Common/Logo.tsx`** — inline SVG logo / mark.

Never render page chrome manually — always wrap via `Layout` through the
`SignedInApp` route tree.

---

## 9. Shop taxonomy

The curated category chips live at the top of `src/pages/Shop.tsx` in
`curatedChips`. They are **patterns**, not DB columns — each chip matches
products by regex on `category` + `gender`. To add a new chip:

```ts
{ label: 'Jewellery', match: (p) => /jewel|earring|necklace/i.test(p.category) }
```

Primary nav categories in `Layout.tsx → primaryCats` map to URL params
consumed by `Shop.tsx` (`?g=Women`, `?c=Footwear`, `?sort=new`, etc.).

---

## 10. Imagery

- Product images are stored as comma-separated URLs in
  `product.imageUrl`. Use `imageUrl.split(',')[0].trim()` for the primary.
- Aspect ratio in grids: **4/5** (`aspect-[4/5]`). Gallery cover: 4/5.
- Background tint for any image container: `bg-sand`.
- Always `loading="lazy"` on non-hero images.
- Missing-image fallback: lowercase italic "no image" in ash — no emojis.

---

## 11. Accessibility

- Focus ring: 2px saffron, 2px offset (set globally).
- Contrast: ink on ivory = 17.8:1 (AAA). Saffron on ivory = 4.6:1
  (AA for large text) — use only on ≥14px bold or larger display type.
- All icon buttons carry `aria-label`.
- All decorative images `alt=""`.
- Drawer has `role="dialog" aria-modal`; closes on route change.

---

## 12. File map for future edits

```
frontend/public/
├── favicon.svg             ← browser tab
├── apple-touch-icon.svg    ← iOS home-screen
├── logo.svg                ← wordmark (OG image too)
├── mark.svg                ← square monogram
├── manifest.json           ← PWA / install
└── index.html              ← fonts, meta, theme-color

frontend/src/
├── index.css               ← tokens + components + legacy compat
├── components/Common/
│   ├── Layout.tsx          ← nav + drawer + footer slot
│   ├── Footer.tsx          ← brand + columns + ticker
│   └── Logo.tsx            ← inline SVG
├── pages/
│   ├── Shop.tsx            ← hero + curated chips + search + filters
│   ├── ProductDetail.tsx   ← gallery + sizing + buy
│   ├── Cart.tsx            ← editorial bag
│   ├── Login.tsx           ← split-screen auth (ink panel + form)
│   ├── Register.tsx        ← same, saffron variant
│   └── Onboarding.tsx      ← single card on editorial canvas
└── tailwind.config.js      ← tokens, custom scales, animations
```

## 13. Legacy compatibility layer

`src/index.css` contains a block labelled **"Legacy-theme compatibility"**
that re-maps old Tailwind classes from the previous slate/cyan dark theme
onto the new ivory/ink palette. This means pages that haven't been
individually rewritten (`Dashboard`, `Wallet`, `Team`, `History`,
`Settings`, `Achievements`, `Admin`, `Checkout`, `UserProfile`) still
render coherently on the new canvas. When you touch one of those pages,
**replace the classes properly** (e.g. `bg-slate-900` → `bg-paper`, cyan
gradients → saffron accent, slate text → ink/ash) and, once the file is
clean, remove its selectors from the compat block if they're no longer
used anywhere.

---

## 14. Never (hard rules)

1. Never add purple-to-pink or cyan-to-blue gradients.
2. Never use emojis in production headings (`🛍️`, `📦`, `🚀`) —
   lucide icons only.
3. Never introduce a 3rd UI font. Fraunces + Instrument Sans + JetBrains Mono, period.
4. Never ship a button without a hover + focus + disabled state.
5. Never render a product image without `loading="lazy"` and `alt`.
6. Never break the `max-w-7xl` content rail on major pages.
7. Never put saffron on saffron. One bright accent per visual element.
8. Never log out the user without `btn-secondary` confirmation styling.

---

_Last revised: 2026-04-16. If you change a token or add a component,
update this file in the same commit._
