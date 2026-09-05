# Design Brief

## Direction

ArteriQ — a premium medical-tech visual system for a portable, non-invasive cardiovascular risk-screening platform, built on a refined clinical-luxury aesthetic of wine, periwinkle, and navy glass.

## Tone

Refined clinical precision with a warm, hopeful, human edge — the calm authority of a modern diagnostics lab, never cold or sterile.

## Differentiation

A wine-red (#58181F) primary on a near-white periwinkle canvas, anchored by the exact ArteriQ 'AQ' logo — connected A and Q with a sharp thin ECG waveform living inside the Q — and frosted glassmorphism on every major surface.

## Logo — Exact 'AQ' Mark

- Clean, modern, stylized connected letters 'A' and 'Q', drawn fluidly and never distorted.
- A sharp thin ECG/heartbeat waveform is integrated inside the bowl of the letter 'Q', connected fluidly to the letterform.
- Adaptive colour: wine #58181F on light surfaces, pure white on dark surfaces, highest-contrast on mid-tone. Applied across splash, header, login, footer, and mobile.
- No device images anywhere; the ECG lives only inside the logo Q.

## Color Palette

| Token      | OKLCH            | Role                                  |
| ---------- | ---------------- | ------------------------------------- |
| background | 0.985 0.005 285  | near-white canvas (#fbfbfe)           |
| foreground | 0.12 0.02 285    | near-black text (#050315)             |
| card       | 0.99 0.006 285   | frosted glass surface                 |
| primary    | 0.32 0.11 20     | wine (#58181F) — brand + CTAs         |
| secondary  | 0.88 0.06 285    | periwinkle (#dedcff) — soft fills     |
| accent     | 0.28 0.13 265    | navy (#000080) — links, highlights    |
| muted      | 0.95 0.01 285    | subdued surfaces                      |

## Typography

- Display: Fjalla One — headings, hero, section titles, logo wordmark
- Body: Montserrat — paragraphs, UI labels, forms, report text
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base lg:text-lg`

## Elevation & Depth

Frosted glass surfaces (`glass` / `glass-strong`) with backdrop-blur, soft inner-glow highlights, and gentle elevated drop shadows create layered depth over a clean, calm background.

## Structural Zones

| Zone    | Background              | Border    | Notes                                          |
| ------- | ----------------------- | --------- | ---------------------------------------------- |
| Header  | glass (blur) fixed      | border-b  | floating frosted nav, adaptive logo            |
| Content | bg-background           | —         | alternating `bg-background` / `bg-muted/30`     |
| Footer  | bg-muted/40             | border-t  | muted glass footer, wine accent links          |

## Spacing & Rhythm

Spacious `py-20 md:py-28` section rhythm with generous `gap-6 md:gap-8` card grids; micro-spacing `space-y-4` for form groups and `gap-3` for chip clusters.

## Component Patterns

- Buttons: pill or `rounded-xl`, wine primary / navy accent / periwinkle secondary, `transition-smooth` hover lift + shadow
- Cards: `rounded-2xl glass`, inner-glow border, gentle `shadow-elevated` on hover
- Badges: `rounded-full`, periwinkle fill with navy text, wine dot for "preliminary" status

## Motion

- Entrance: `fade-up` staggered section reveals (0.6s, buttery cubic-bezier)
- Hover: `transition-smooth` lift + shadow deepening (0.35s)
- Decorative: `float-slow` ambient orbs only — no ECG/pulse-wave background lines

## Constraints

- Exact palette enforced via OKLCH tokens only — no raw hex in components
- Glassmorphism on all major cards, panels, forms, modals, and the report container
- No ECG/pulse-wave background lines anywhere; ECG lives only inside the logo Q
- No device images anywhere
- Full dark-mode support with adaptive logo (wine on light, white on dark)
- Copy stresses preliminary screening only — professional, hopeful, precise, human
- Body Montserrat, headings Fjalla One

## Signature Detail

The exact 'AQ' logo — a stylized A and Q joined as one mark, with a sharp thin ECG heartbeat integrated inside the Q — the brand's heartbeat rendered as its identity, on frosted glass.
