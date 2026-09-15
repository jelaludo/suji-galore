# sūji-galore 数字 galore — build spec

> Working name. Rename freely (`kazu-lab`, `numeral-galore`, …); the spec only assumes one repo, one static site.

A static, mobile-first web lab that renders numbers in many visual numeral systems — historical, fictional-inspired, and invented — and lets the viewer **display**, **count up**, **count down**, and **quiz** each one. Later phases add analysis tools and a forge for designing new systems.

This document is the complete brief for a coding CLI agent. Read it fully before writing code. Build in the phase order in §12; each phase has acceptance criteria.

---

## 0. Constraints (non-negotiable)

- **Stack:** vanilla ES modules, HTML, CSS, SVG. **No build step, no framework, no bundler.** Must run from any static host (`python3 -m http.server` locally; GitHub/Codeberg/Cloudflare Pages in prod).
- **Dependencies:** none at runtime for Phase 1–4. Optional later: `opentype.js` (font export, Phase 6) loaded from a pinned CDN URL.
- **Rendering:** SVG is the primary renderer (crisp at any size, per-part animation, easy export). Canvas only if a skin measurably needs it (§7).
- **Aesthetic:** near-black background (`#08080a` range), OKLCH accents (amber primary, teal secondary), JetBrains Mono for figures/UI, EB Garamond or Cormorant Garamond for prose (Google Fonts, with system fallbacks).
- **Mobile:** `viewport-fit=cover`, safe-area insets, installable PWA manifest, touch-first; 60 fps target with ~40 animated cards (pause off-screen with `IntersectionObserver`).
- **Accessibility:** every rendered glyph has `role="img"` and `aria-label="<decimal value> in <system name>"`. Honour `prefers-reduced-motion` (transitions become cuts).
- **Storage:** `localStorage` only for per-viewer settings and quiz stats, every access wrapped in `try/catch`; site must work with storage unavailable.
- **IP:** do not reproduce copyrighted fictional glyph sets (film props, game fonts). Fiction is used only as *behavioural* inspiration (§6.4). All glyph geometry in this repo is either historical/public-domain, derived from Unicode reference charts, or original.
- **No PII** in code, comments, commit messages, or content.

---

## 1. References

### 1.1 Sibling labs (study these first — match their UX feel)

- **dexipurei-galore** — display-simulator gallery: https://kai-denrei.github.io/dexipurei-galore/
  One text input at top ("type anything; displays that can render it, will"); a grid of live preview cards; cards that cannot render the input dim; tap a card → full-screen view. Dot-matrix, segment, Nixie, VFD, split-flap, CRT, e-ink, voxel. **sūji-galore should feel like its sibling**: same interaction model, and its display *skins* are the visual vocabulary for §7. Inspect its page source for skin techniques before inventing new ones.
- **heptaweave** — hybrid of the Arrival-style ink-ring logogram and Cistercian quadrant numerals: https://kai-denrei.github.io/heptaweave/
  It is the precedent for Phase 6 (invented systems). Include it in the gallery as an external-link card (or embed if its module is importable), not a reimplementation.

### 1.2 Scholarly / general

- Stephen Chrisomalis, *Numerical Notation: A Comparative History*, Cambridge University Press, 2010. **Use its typology** (§3.3) for classification.
- Karl Menninger, *Number Words and Number Symbols: A Cultural History of Numbers*, MIT Press 1969 / Dover 1992.
- Georges Ifrah, *The Universal History of Numbers*, Wiley 2000.
- David A. King, *The Ciphers of the Monks: A Forgotten Number-Notation of the Middle Ages*, Franz Steiner Verlag, 2001. (Cistercian numerals.)
- Jacques Bertin, *Semiology of Graphics* (visual variables: position, size, shape, value, orientation…) — framing for §9.
- Subitizing: E. L. Kaufman et al., "The discrimination of visual number," *American Journal of Psychology* 62 (1949). Rationale for cumulative groups of ≤4–5.

### 1.3 Per-system references

| System | Reference |
|---|---|
| Cistercian | https://en.wikipedia.org/wiki/Cistercian_numerals ; King 2001. Not encoded in Unicode → SVG only. |
| Kaktovik (Iñupiaq) | https://en.wikipedia.org/wiki/Kaktovik_numerals ; Unicode chart U+1D2C0–1D2D3 (Unicode 15.0): https://www.unicode.org/charts/PDF/U1D2C0.pdf |
| Maya | https://en.wikipedia.org/wiki/Maya_numerals ; Unicode chart U+1D2E0–1D2F3: https://www.unicode.org/charts/PDF/U1D2E0.pdf |
| Babylonian cuneiform | https://en.wikipedia.org/wiki/Babylonian_cuneiform_numerals |
| Chinese counting rods | https://en.wikipedia.org/wiki/Counting_rods ; Unicode U+1D360–1D378: https://www.unicode.org/charts/PDF/U1D360.pdf |
| Suzhou numerals 蘇州碼子 | https://en.wikipedia.org/wiki/Suzhou_numerals ; U+3021–3029, U+3038–303A in https://www.unicode.org/charts/PDF/U3000.pdf |
| Egyptian hieroglyphic numerals | https://en.wikipedia.org/wiki/Egyptian_numerals |
| Soroban 算盤 | https://en.wikipedia.org/wiki/Soroban |
| Quipu | https://en.wikipedia.org/wiki/Quipu ; Ascher & Ascher, *Mathematics of the Incas: Code of the Quipu* (Dover 1997) |
| Tally / 正 | https://en.wikipedia.org/wiki/Tally_marks |
| Braille | https://en.wikipedia.org/wiki/English_Braille (numeric indicator ⠼) ; Unicode Braille Patterns U+2800–28FF: https://www.unicode.org/charts/PDF/U2800.pdf |
| Balanced ternary | https://en.wikipedia.org/wiki/Balanced_ternary ; Setun computer |
| Gray code | https://en.wikipedia.org/wiki/Gray_code |
| Seven-segment | https://en.wikipedia.org/wiki/Seven-segment_display |
| Unicode geometric shapes used by the nibble systems | https://www.unicode.org/charts/PDF/U25A0.pdf (◸◹◺◿ U+25F8–25FF, ◜◝◞◟ U+25DC–25DF) |

> Agent rule: where this spec gives exact geometry, use it. Where it says **TRACE**, derive geometry from the linked Unicode chart glyphs, and add a `// VERIFY:` comment plus an entry in `docs/verify.md` for human visual check. Never silently guess.

---

## 2. Repository layout

```
/
├─ index.html              gallery (entry)
├─ view.html               full-screen single-system view (?s=<id>&mode=<mode>&v=<n>)
├─ manifest.webmanifest
├─ sw.js                   offline cache (Phase 5)
├─ css/
│  ├─ base.css             tokens (OKLCH), layout, safe areas
│  └─ skins.css            skin variables + SVG filter hooks
├─ js/
│  ├─ app.js               gallery bootstrap
│  ├─ view.js              full-screen controller
│  ├─ core/
│  │  ├─ registry.js       system registration + lookup
│  │  ├─ glyph.js          Part / Glyph / Layout types + helpers
│  │  ├─ render-svg.js     Layout → SVG, keyed by part id
│  │  ├─ transition.js     part-diff animation engine
│  │  ├─ digits.js         base conversion, signed/balanced helpers
│  │  ├─ store.js          safe localStorage wrapper
│  │  └─ element.js        <suji-display> custom element (§10)
│  ├─ modes/
│  │  ├─ display.js
│  │  ├─ count.js          count-up + count-down + ammo/sentry sub-mode
│  │  └─ quiz.js
│  ├─ skins/
│  │  ├─ ink.js  nixie.js  phosphor.js  led.js  engraved.js  blueprint.js
│  ├─ systems/
│  │  ├─ cistercian.js  kaktovik.js  maya.js  babylonian.js
│  │  ├─ rods.js  suzhou.js  egyptian.js  soroban.js  quipu.js
│  │  ├─ tally-gate.js  tally-sei.js  braille.js  braille8.js
│  │  ├─ binary.js  gray.js  ternary-bal.js  seg7.js  clock.js
│  │  ├─ kado.js           corner-triangle nibble (§6.3)
│  │  ├─ ko.js             arc nibble (§6.3)
│  │  ├─ erosion.js        fiction-inspired countdown glyph (§6.4)
│  │  └─ index.js          imports + registers all
│  ├─ analysis/            Phase 5
│  └─ forge/               Phase 6
├─ tests/
│  ├─ index.html           in-browser test runner (no deps)
│  └─ *.test.js
└─ docs/
   ├─ systems/<id>.md      per-system notes, sources, history blurb (EN + JA title)
   └─ verify.md            human visual-check list
```

---

## 3. Core model

### 3.1 Parts, glyphs, layouts

Everything rendered is a **set of named parts**. This single idea powers rendering, transitions (erosion/accretion), quiz part-toggling, and legibility metrics.

```js
// js/core/glyph.js
/** @typedef {{
 *   id: string,              // stable, unique within a Layout, e.g. "u:1", "t:6", "rod3:v2"
 *   kind: 'line'|'path'|'arc'|'poly'|'circle'|'dot'|'text',
 *   d?: string,              // SVG path data in the glyph's local unit box
 *   pts?: number[][],        // for line/poly
 *   r?: number, cx?: number, cy?: number,
 *   fill?: boolean,          // stroke by default
 *   weight?: number,         // stroke-width multiplier (default 1)
 *   role?: string            // semantic tag: 'stem','unit','five','zero','sep'…
 * }} Part */

/** @typedef {{
 *   parts: Part[],
 *   box: {w:number, h:number},   // local units
 *   meta: {value:number, digits:number[], base:number}
 * }} Layout */
```

Helpers: `mirrorX(parts, axis)`, `mirrorY(parts, axis)`, `rotate(parts, deg, cx, cy)`, `translate(parts, dx, dy)`, `scale`, `prefixIds(parts, prefix)`, `union(...partLists)`.

### 3.2 System interface

```js
// every js/systems/*.js default-exports:
export default {
  id: 'cistercian',
  name: 'Cistercian',
  nameJa: 'シトー会数字',
  base: 10,
  range: { min: 0, max: 9999 },       // integers; systems may extend via multi-glyph
  multiGlyph: 'none' | 'row' | 'stack' | 'ring', // how values beyond one glyph are laid out
  class: { chrisomalis: 'ciphered-additive', structure: 'quadrant' }, // §3.3
  origin: 'historical' | 'unicode' | 'modern' | 'invented' | 'inspired',
  tags: ['monastic', 'compact', 'spatial'],
  canRender(n) {},                    // → boolean  (drives card dimming)
  layout(n, opts) {},                 // → Layout   (pure, deterministic)
  explain(n) {},                      // → [{partIds:[…], label:'3 × 100'}] for hint overlay
  quiz: { answerBase: 10, difficulty: [[0,9],[0,99],[0,999],[0,9999]] },
  sources: ['https://…'],
};
```

`layout()` must be **pure** and produce **stable part ids** for the same semantic stroke across values (e.g. Cistercian tens-digit stroke "1" is always `t:1`). Transitions depend on this.

### 3.3 Classification (Chrisomalis)

Tag every system with one of: `cumulative-additive` (Egyptian, tally), `cumulative-positional` (Babylonian, Maya), `ciphered-additive` (Cistercian — a distinct sign per power), `ciphered-positional` (Hindu-Arabic, Kaktovik digits, binary/nibble glyphs), `multiplicative-additive` (Suzhou with unit markers, spoken-CJK style). Add a free `structure` tag for the spatial scheme: `row`, `stack`, `quadrant`, `ring`, `lattice`, `bead`, `knot`, `rotation`, `cell`. The gallery filters on both.

### 3.4 Renderer

`render-svg.js`: `renderLayout(layout, {skin, size, pad}) → SVGElement`. Each part becomes one element with `data-part="<id>"`. Uses `vector-effect="non-scaling-stroke"` so skins control stroke width independent of glyph scale. Keyed reconciliation: `updateLayout(svg, nextLayout)` diffs by part id.

### 3.5 Transition engine

`transition.js` computes `{added, removed, kept}` by part id and animates:

- **removed:** skin-defined exit (default: stroke-dashoffset retract 180 ms; nixie: fade-with-afterglow; erosion: fracture/fall, §6.4)
- **added:** entry (default: stroke draw-on 180 ms; nixie: warm-up flicker)
- **kept:** untouched (this is what makes counting feel alive — only changed strokes move)

Also support `carry` cascades for counters: when several digits change at once (e.g. 1999→2000), stagger by position, least significant first, 40 ms apart. Reduced-motion → instant swap.

---

## 4. Modes

All four modes are available for every system, in both the gallery card (compact controls) and the full-screen view (full controls). URL state: `view.html?s=kaktovik&mode=down&from=400&rate=4&skin=nixie`.

### 4.1 Display

- Global numeric input on the gallery (like dexipurei-galore's text input). Accept decimal integers; also `0x…`, `0b…`, and negative values. Cards whose `canRender` is false dim to ~25 % with a small reason chip ("max 9999", "no negatives").
- Full-screen: large glyph, decimal value toggle (show/hide), **explain** toggle (colours parts by `explain()` groups with labels), skin picker, size slider, "export SVG" button (serialises current SVG; delivered by opening a new tab with a data URL, not a forced download).
- Random button; "±1" nudge buttons; keyboard ↑/↓.

### 4.2 Count-up

- Params: `from`, `to` (default system max), `rate` (steps/s, 0.5–60), `step` (1, base, base²…), `accel` (none / linear / exponential), `loop`.
- Odometer behaviour: carry cascade (§3.5).
- Optional tick sound via Web Audio (synthesised click, per-skin timbre; off by default).
- Presets: "score", "XP bar", "stopwatch" (clock/sexagesimal systems use real seconds), "year counter".

### 4.3 Count-down

- Params: `from`, `rate`, `warn` threshold, `critical` threshold. Below `warn` the skin shifts accent amber→red; below `critical` add pulse/flicker. At 0: skin-specific terminal state (nixie cathode blank, erosion shatter, ink bleed).
- **Timer sub-mode:** duration in real time (mm:ss), glyph shows remaining seconds (or sexagesimal pair for base-60 systems).
- **Ammo / sentry sub-mode** (game UI testbed):
  - `magazine` size (default 30; test 9999 for Cistercian nixie).
  - Fire: tap / space → −1; hold → auto-fire at configurable RPM (e.g. 600).
  - Reload: `R` / reload button → animated refill (accretion) with a reload duration.
  - Sentry variant: auto-fires in bursts; shows a second small glyph for reserve ammo.
  - Low-ammo state from `warn`; empty state clicks/dims.
  - This is where per-part erosion matters most: the player should feel ammo drain without reading.

### 4.4 Quiz

Core loop: a glyph is shown → the player reads it → enters the value.

- **Read (typed):** numeric keypad UI (mobile) / keyboard. Answer in decimal by default; option to answer in native base for base-20/60 systems (entered as digit groups `3.14.0`).
- **Read (choice):** 4 options; distractors chosen by §9 visual similarity (nearest by part-Jaccard), not random — distractors must be *hard*.
- **Compose (reverse):** decimal value shown → player builds the glyph by tapping parts on a ghost lattice of all possible parts. Essential for the nibble systems and Cistercian.
- **Speed:** 60 s, as many as possible; glyph exposure time optionally limited (flash 300–1500 ms) to test pre-attentive readability.
- **Difficulty:** levels from `system.quiz.difficulty` ranges; adaptive mode raises range after 5 correct in a row, lowers after 2 misses.
- **Hints:** first hint = explain overlay for one group; second = full explain; hinted answers score less.
- **Learning scaffold:** "training wheels" slider fades a decimal overlay from 100 % to 0 % across the first N questions.
- **Stats (localStorage):** per system: attempts, accuracy, median response time, per-value error counts, confusion pairs (shown→answered). Displayed as a small table + a heatmap of values by error rate on the system page. Export/import stats as JSON (copy to clipboard).
- Feedback: correct → brief accent pulse; wrong → show correct value and highlight the parts that differ between the shown glyph and the glyph of the wrong answer (part-diff again).

---

## 5. Gallery UI (index.html)

Mirror dexipurei-galore:

- Header: `sūji-galore 数字 galore` + one-line description (EN, with JA subtitle).
- Sticky input bar: number field, random, ±, global mode switch (display / up / down / quiz-preview), global skin override.
- Filter chips: origin, Chrisomalis class, structure, base. Sort: name, base, max range, quiz accuracy.
- Card grid (auto-fill, min 160 px): live glyph, name (EN + JA), base badge, class chip. Tap → `view.html`.
- Comparison strip (toggle): the current value rendered in every system in one horizontal scroll row at uniform height — the "same number, every script" view.
- Footer: link to `docs/`, sources, and the sibling labs.
- Colour tokens (in `base.css`):
  ```css
  :root{
    --bg: #08080a; --panel: oklch(0.17 0.01 260); --line: oklch(0.30 0.01 260);
    --text: oklch(0.92 0.01 90); --dim: oklch(0.62 0.01 90);
    --amber: oklch(0.80 0.15 70); --teal: oklch(0.78 0.11 190);
    --warn: oklch(0.78 0.16 55); --crit: oklch(0.65 0.22 28);
  }
  ```
  Dark-first; a light theme is optional (Phase 5).

---

## 6. System catalog

Unless stated, box units: glyph local coordinates, y grows downward. Each system also gets `docs/systems/<id>.md` (history, sources, how to read it, a 0–20 reference table rendered live).

### 6.1 Phase-2 core set (build these first, in this order)

#### Cistercian — `cistercian` — base 10, 0–9999 per glyph

- Box: x ∈ [-1, 1], y ∈ [0, 3]. Stem: `(0,0)–(0,3)`, part id `stem` (always present; value 0 = stem only).
- Units in top-right quadrant, x ∈ [0,1], y ∈ [0,1]. Stroke primitives (units form):

  | id | stroke |
  |---|---|
  | `a` | (0,0)–(1,0) top horizontal |
  | `b` | (0,1)–(1,1) lower horizontal |
  | `c` | (0,0)–(1,1) diagonal down |
  | `d` | (0,1)–(1,0) diagonal up |
  | `e` | (1,0)–(1,1) outer vertical |

  Digit → strokes: 1 `a`; 2 `b`; 3 `c`; 4 `d`; 5 `a+d`; 6 `e`; 7 `a+e`; 8 `b+e`; 9 `a+b+e`.
- Tens: mirror units across x=0 (top-left). Hundreds: mirror across y=1.5 (bottom-right). Thousands: both mirrors (bottom-left). Part ids: `u:a`, `t:a`, `h:a`, `k:a` etc.
- Beyond 9999: `multiGlyph: 'row'` groups of four digits (like 10⁴ grouping), plus the medieval variant note in docs.
- Note: some sources draw 2 at a different height or swap 3/4 orientation — document the chosen convention and cite Wikipedia's chart.
- Nixie variant is a *skin* (§7), not a separate system: each quadrant-stroke is a cathode.

#### Kaktovik — `kaktovik` — base 20 (sub-base 5), positional, any size

- Digit 0–19 = `fives × 5 + ones`, fives ∈ 0..3, ones ∈ 0..4.
- Structure: upper part holds 0–3 stacked horizontal strokes (fives); lower part holds a connected zigzag of 0–4 strokes (ones) hanging below the lowest bar. Zero is a distinct glyph.
- **TRACE** exact geometry (stroke angles, zigzag start side, bar spacing, zero shape) from the Unicode chart U+1D2C0–1D2D3. Encode as parts `f1,f2,f3` and `o1..o4` + `zero`, so that counting 0→19 only adds/removes strokes (this is the system's beauty: arithmetic is visible — show it).
- Multi-digit: `row`, most significant left, small gap.
- Bonus (Phase 5): "visual arithmetic" demo — addition/subtraction by stroke union with carry at 5 and 20.
- Also offer the Unicode text rendering as a fallback card if a font is present (feature-detect by measuring a glyph); SVG remains primary.

#### Maya — `maya` — base 20, vertical, cumulative-positional

- Digit: 0–3 horizontal bars (5 each) at bottom, 0–4 dots in a row above; zero = shell (draw an original stylised shell/ellipse with inner arcs; **TRACE** proportions from U+1D2E0).
- Multi-digit: `stack`, most significant **on top**.
- Docs note the calendar variant (third place ×18) — implement as option `calendar: true`.

#### Kado 角 — `kado` — corner-triangle nibble, base 16 (user idea)

- Unit square [0,1]². Four filled right triangles in the corners, legs 0.5:
  bit0 (1) ◸ top-left, bit1 (2) ◹ top-right, bit2 (4) ◺ bottom-left, bit3 (8) ◿ bottom-right.
- Value = union; 0 = empty square outline (part `frame`, thin), 15 = four corners (reads as a diamond hole — note this in docs as a feature).
- Multi-nibble options: `row` (hex byte = 2 cells), `nest` (each successive nibble drawn in a square inset 0.5× and rotated 45°, making a byte into a compact rosette), `lattice` (2×2 cells for 16 bits).
- Variants (flag): `legs: 0.5 | 1.0` (1.0 = full-diagonal halves, so ◸+◿ overlap — test legibility), `fill | outline`.

#### Ko 弧 — `ko` — arc nibble, base 16 (user idea)

- Unit circle quadrant arcs: bit0 ◜ top-left, bit1 ◝ top-right, bit2 ◟ bottom-left, bit3 ◞ bottom-right. (◠ = 3, ◡ = 12, full ring = 15.)
- 0 = centre dot (`zero`).
- Multi-nibble: **concentric rings**, least significant outermost (option to invert). 16-bit = 4 rings. Option `sweep` staggers each ring's start angle by 22.5° so ring edges don't align.
- This is structurally close to heptaweave — cross-reference in docs.

#### Seven-segment — `seg7` — base 10 (and hex), baseline/control

- Standard segments a–g + dp. Hex mode uses A b C d E F. Include as a control system for §9 comparisons.

#### Tally, gate — `tally-gate` — unary, cumulative

- Groups of 5: four verticals + diagonal strike. Rows of groups, wrap at 50. Range 0–200 (dim above).

#### Tally, 正 — `tally-sei` — unary, cumulative, Japan/China

- Each 正 is 5 strokes in canonical stroke order: 1 top horizontal, 2 centre vertical, 3 middle short horizontal (right side), 4 left short vertical, 5 bottom horizontal. Partial characters show only the first k strokes. Geometry: original, clean, derived from standard stroke order.
- Count-up animation draws strokes in stroke order (ties into FUDE-style stroke drawing).

### 6.2 Phase-3 extended set

| id | base | summary / encoding | layout |
|---|---|---|---|
| `babylonian` | 60 | units 1–9 as vertical wedges (rows of 3), tens 1–5 as corner wedges (winkelhaken), left of units; place gap for empty (optional late-period separator glyph). Wedge = original stylised triangle-headed stroke. | row |
| `rods` | 10 | Counting rods. Units/hundreds/10⁴… use *vertical* form: 1–5 vertical strokes, 6–9 = horizontal 5-bar on top + 1–4 verticals. Tens/thousands… use *horizontal* form (rotate 90°): 1–5 horizontal strokes, 6–9 = vertical 5-bar + horizontals. Zero = empty cell (option: circle). Red/black for positive/negative. | row |
| `suzhou` | 10 | 〡〢〣〤〥〦〧〨〩 for 1–9, 〇 zero. Rule: consecutive 1/2/3 alternate to horizontal forms (一二三) to avoid ambiguity. Optional second line with magnitude marker (十, 百, 千, 万) for the first digit. Render as SVG strokes (TRACE from U+3021–3029). | row (+ unit line) |
| `egyptian` | 10 | cumulative-additive: stroke 1, hobble 10, coil 100, lotus 1000, finger 10⁴, tadpole 10⁵, kneeling figure 10⁶. Draw **original minimal line icons**, not traced hieroglyph fonts. Group each power in rows of up to 4/5. Written largest→smallest, right-to-left option. | row |
| `soroban` | 10 | one rod per digit: heaven bead (5) above beam, 4 earth beads below; active beads touch the beam. Beads animate sliding on change (the best count animation in the lab). Unit-point dots on beam every 3 rods. | row of rods |
| `quipu` | 10 | pendant cord per number; clusters of single knots for 10ⁿ positions (n≥1), units as long knot with 2–9 turns, figure-eight knot for 1, empty space for 0. Main cord horizontal; option to hang several values (a "ledger"). | cord |
| `braille` | 10 | numeric indicator ⠼ then a–j cells (1=⠁ … 9=⠊, 0=⠚). Dots as circles; empty dot positions as faint rings (toggle). | row of cells |
| `braille8` | 256 | 8-dot cell = one byte; dot n ↔ bit n−1 (Unicode U+2800 ordering). Pairs with `kado`/`ko` as another bitwise family. | row |
| `binary` | 2 | LED column clock style (BCD option) or straight binary; on/off dots. | row/columns |
| `gray` | 2 | Gray code bits; show why only one part changes per step (transition demo). | row |
| `ternary-bal` | 3 | digits −,0,+ as down-tick / dot / up-tick; negatives natural. | row |
| `clock` | 60/12 | rotation system: hand angles encode value (single hand = 0–59; two hands = h:m). | dial |
| `dice` | 6 | pip faces 1–6, base-6 with 0 = blank face; positional row. | row |

### 6.3 Nibble family notes

`kado`, `ko`, `braille8`, `binary`, `gray` form the **bitwise-union** family: value = set of parts ↔ set of bits. For these, Compose quiz (§4.4) is the primary learning mode, and docs should state the trade-off plainly: ink mass does not track magnitude (8 and 7 look unrelated; 8 and 15 share a corner), so they suit IDs, codes, lore ciphers, and bit flags more than HP or ammo.

### 6.4 Fiction-inspired — `erosion` (original design)

Inspiration only: countdown glyphs in sci-fi film props where the display visibly *decays* toward zero. **Do not copy any film's glyph set.** Design an original system:

- Base 10, positional, max 3 digits (display column like a wrist device, digits stacked vertically or in a row — option).
- Digit 9 is the most complex glyph (9 short angular strokes on a 3×3 lattice of slanted marks); each lower digit removes one stroke in a fixed, *asymmetric* removal order so every digit is distinct and the glyph thins as the count falls (cumulative within the digit, so ink ∝ value). 0 = a single hooked mark (not empty).
- Stroke style: angular, slightly irregular (seeded jitter per stroke, stable per part id).
- Exit animation: stroke fractures into 2–3 segments that drift down and fade (the characteristic "erosion" feel). Critical state: red phosphor with scanline flicker.
- Document the design in `docs/systems/erosion.md` including the removal-order table.

### 6.5 External / partner

- `heptaweave` — gallery card links out to https://kai-denrei.github.io/heptaweave/ with a static preview. If its code exposes an importable renderer, wrap it in the system interface instead (ask before vendoring code).

---

## 7. Skins

Skins are orthogonal to systems: any system × any skin. A skin module exports:

```js
export default {
  id: 'nixie',
  defs(svg) {},                 // inject <filter>, <linearGradient> once per SVG
  styleIdle(el, part) {},       // unlit cathode / ghost lattice (optional)
  styleOn(el, part) {},
  enter(el, part) {}, exit(el, part) {},   // animations (Web Animations API)
  state(el, 'normal'|'warn'|'critical'|'empty') {},
  ghost: true                    // draw all possible parts faintly behind lit ones
};
```

Required skins:

1. **ink** — sumi-e: warm off-white on near-black, variable stroke width, slight feathering filter; draw-on in stroke order.
2. **nixie** — orange neon (`oklch(0.75 0.17 55)`), inner white core + blurred halo (two stacked strokes + `feGaussianBlur`), ghost cathodes (all possible parts at 6 % opacity), mesh overlay pattern, glass tube frame for the gallery card. Warm-up flicker on enter, afterglow on exit, occasional cathode-poisoning flicker when idle (subtle, toggleable).
3. **phosphor** — CRT green or amber, scanlines, bloom, slight barrel via SVG displacement (or CSS on container), persistence trails on exit.
4. **led** — parts rasterised to a dot grid (sample each part's path onto an N×N dot matrix via `getPointAtLength`), lit dots with glow.
5. **engraved** — metal plate, parts as inset grooves (inner shadow via filter); no glow; for "physical" in-game props.
6. **blueprint** — cyan line-art on dark blue, dimension-line style, shows part ids on hover (debug skin, doubles as explain view).

Reuse and cross-reference dexipurei-galore's skin techniques; keep visual parity where the same display type exists (Nixie, CRT, dot-matrix).

---

## 8. Full-screen view (view.html)

- Top bar: back, system name (EN/JA), mode tabs (Display · Up · Down · Quiz), skin picker, info (opens docs panel).
- Centre: glyph at max size within safe area.
- Bottom sheet (collapsible): mode controls from §4.
- Info panel: rendered `docs/systems/<id>.md` (tiny inline Markdown renderer, headings/paragraphs/tables/links only), 0–20 live reference grid, sources list.
- Landscape: controls move to the side.

---

## 9. Analysis (Phase 5)

A `lab.html` page with computed and measured legibility metrics per system:

- **Adjacent distance:** mean Jaccard distance of part sets between n and n+1 over the range. Low = smooth counting; high = flicker-y counting.
- **Confusability:** for each n, the nearest other value by part-Jaccard within the difficulty range; list the worst 10 pairs; distractor source for quiz.
- **Ink monotonicity:** Spearman ρ between total stroke length (via `getTotalLength`) and value. ≈1 for cumulative systems, ≈0 for bitwise. Shows *why* a system suits HP/ammo or not.
- **Density:** values per unit area at a fixed legible stroke width.
- **Measured:** pull quiz stats — accuracy, response time vs. value, confusion matrix heatmap.
- Output a comparison table + scatter (x: adjacent distance, y: ink monotonicity), systems as labelled points. Keep charts in plain SVG.

---

## 10. Embeddable component (Phase 4)

For reuse in websites and games:

```html
<script type="module" src="js/core/element.js"></script>
<suji-display system="cistercian" skin="nixie" value="1234"></suji-display>
```

- Attributes: `system`, `skin`, `value`, `size`, `ghost`, `label` (aria override).
- Properties/methods: `.value`, `.set(n, {animate})`, `.countTo(n, {rate})`, `.fire()` / `.reload(n)` (ammo helpers), `.state = 'warn'`.
- Events: `change`, `empty`, `countend`.
- Shadow DOM, no global CSS leakage; system/skin modules lazy-imported.
- `examples/` folder: HUD mock (ammo + reserve + timer), score counter, loading countdown.

---

## 11. Testing

In-browser runner at `tests/index.html` (tiny assert lib, no deps). Required tests:

- Every system: `layout(n)` deterministic; part ids unique within a layout; `canRender` matches `range`.
- **Uniqueness:** for every system, all values in its test range produce distinct part-id sets (catches encoding bugs). Test range: full range if ≤ 10 000, else a seeded sample of 5 000 plus boundaries.
- **Round-trip:** each system implements `decode(partIds) → n` (needed for Compose quiz); assert `decode(layout(n)) === n`.
- Cistercian spot checks: 1 = `u:a`; 1993 = `k:a`, `h:a+b+e`, `t:a+b+e`, `u:c`; 9999 = 12 strokes + stem.
- Kaktovik: 19 = `f1,f2,f3,o1..o4`; 20 = two digits `[1][0]`.
- Kado: 3 = {bit0, bit1}; 15 = all four; nest-mode byte 0xA5 layout snapshot.
- Soroban: 7 = heaven + 2 earth on units rod.
- Transition: diff of 1999→2000 in Cistercian yields the expected added/removed sets.
- Visual: `tests/sheet.html` renders 0–99 (and boundaries) for every system × `blueprint` skin on one page for human review; list anything marked TRACE in `docs/verify.md`.

---

## 12. Phases and acceptance criteria

**Phase 1 — skeleton**
Core model, registry, SVG renderer, transition engine, `ink` + `blueprint` skins, gallery + view pages, Display mode, `cistercian` + `seg7`.
✔ Typing a number updates both cards live; 10 000 dims Cistercian with reason chip; tapping opens view; explain overlay works; tests pass.

**Phase 2 — core set + modes**
Systems of §6.1 (`kaktovik`, `maya`, `kado`, `ko`, `tally-gate`, `tally-sei`), Count-up, Count-down (incl. timer and ammo/sentry), Quiz (read-typed, read-choice, compose), `nixie` skin.
✔ Cistercian × nixie ammo mode at 9999 fires at 600 RPM at 60 fps on a mid-range phone; only changed cathodes animate. ✔ Quiz stats persist and survive storage failure gracefully. ✔ Kaktovik 0→19 count-up visibly adds strokes only.

**Phase 3 — extended catalog**
§6.2 systems, `erosion`, heptaweave card, `phosphor`, `led`, `engraved` skins, filters/sort, comparison strip, per-system docs.
✔ Every system has docs, sources, 0–20 grid; all TRACE items listed in verify.md.

**Phase 4 — embeddable**
`<suji-display>` component + examples.
✔ HUD example runs standalone from `examples/hud.html` with only the element script imported.

**Phase 5 — analysis + polish**
`lab.html` metrics (§9), speed quiz, adaptive difficulty, training-wheels, PWA offline (`sw.js`), optional light theme, Kaktovik visual-arithmetic demo.
✔ Scatter plot shows cumulative systems top-left-ish vs bitwise bottom; offline reload works.

**Phase 6 — the forge (inventing new systems)**
See §13.

---

## 13. Phase 6: forge — designing new numeral systems

Goal: design new systems in the spirit of heptaweave, possibly in other bases, and evaluate them with the same tools.

### 13.1 Grammar

A system can be declared as data instead of code:

```json
{
  "id": "dodeca-ring",
  "base": 12,
  "lattice": { "type": "ring", "segments": 12, "rings": 1 },
  "digit": { "mode": "table", "table": { "0": ["seg0"], "1": ["seg1"], "…": [] } },
  "compose": { "mode": "concentric", "order": "lsb-outer", "gap": 0.18 },
  "constraints": { "minJaccard": 0.25, "uniqueUnderRotation": true }
}
```

- `lattice` types: `square(n×n)` edges+diagonals, `tri`, `hex`, `ring(segments, rings)`, `stem-quadrant` (Cistercian generalisation), `radial-spokes`, `custom` (list of parts).
- `digit.mode`: `table` (explicit ciphered), `bits` (bitwise union over chosen parts), `cumulative` (k-of-n with sub-base), `rotation` (one primitive × angle).
- `compose.mode`: `row`, `stack`, `quadrant` (up to 4 positions via mirrors — generalise to 6 via hex symmetry, 8 via dihedral D4), `concentric`, `spiral`, `recursive` (Sierpiński-style: each digit subdivides its cell, next digit draws in a sub-cell).
- A generic `grammar-system.js` turns JSON into the §3.2 interface, so forged systems get all modes, skins, quiz, and metrics for free.

### 13.2 Forge UI (`forge.html`)

- Pick lattice → tap parts to assign per digit (or auto-generate for `bits`/`cumulative`).
- Live constraint checker: duplicate digits, digits that collide under the compose symmetry (e.g. a quadrant-mirrored digit equal to another digit in another position — the classic Cistercian-design hazard), min pairwise Jaccard, ink monotonicity.
- **Auto-suggest:** search digit tables maximising min-Jaccard subject to "ink grows with value" (greedy + random restarts; seeded; runs in a Web Worker).
- Save as JSON (localStorage + copy/paste), load into gallery as `origin: 'invented'`.
- Export: SVG sheet; Phase 6b: OpenType font via `opentype.js` (each digit a glyph; positional composition via ligature/`calt` substitution for fixed-width groups — document limitations).

### 13.3 Seed ideas to prototype

- **Dozenal ring** (base 12): 12-segment ring, cumulative clockwise fill with sub-base 3 tick marks — reads like a clock.
- **Hex-quadrant** (base 6 or 16): Cistercian generalised to a hexagonal stem star with 6 positions (6 digits per glyph via D6 symmetry).
- **Sexagesimal dial** (base 60): 10×6 decomposition — outer ring tens (0–5 arcs), inner lattice units (0–9 Cistercian-style), one compact glyph per base-60 digit.
- **Heptaweave-like base 7 / base 16**: concentric ink rings where each ring is one digit, digit encoded by arc-gaps and inner hooks; ink texture from the `ink` skin.
- **Recursive triangle** (base 4): each digit selects one of 4 sub-triangles; n digits = depth-n Sierpiński address. Beautiful at 8+ digits.
- **Kaktovik-dozenal**: base 12 with sub-base 3 or 4 using Kaktovik's bar-over-zigzag logic.

---

## 14. Non-goals

- No server, accounts, or analytics.
- No copying of fictional/film/game glyph sets or proprietary fonts.
- No framework migration. No TypeScript build (JSDoc types are fine).
- No attempt at full historical paleographic accuracy; each system's docs state the chosen convention and its source.

---

## 15. Agent working rules

1. Work phase by phase; commit at each acceptance point with a descriptive message.
2. Before a TRACE geometry, open the referenced chart, describe the glyph in the commit/docs, then encode. Flag uncertainty in `docs/verify.md`.
3. Keep every system file self-contained (< ~300 lines); shared geometry goes to `core/glyph.js`.
4. Run `tests/index.html` (headless Chromium via Playwright is fine for CI; not a runtime dependency) before every commit.
5. When a design decision is ambiguous and not covered here, choose the simplest option, record it in `docs/decisions.md`, and continue.
