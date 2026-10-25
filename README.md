# sūji-galore 数字 galore

A gallery-first playground for visual representations of numbers. Its initial viewport gives the available space to the glyphs; navigation, motion, surfaces, and transition presets remain compact or disclosed on demand.

Run `npm start` in this directory, then open http://localhost:8137 . The preview serves the current project with caching disabled. No framework or runtime package dependencies. Optional Google Fonts have system fallbacks. Run `npm run build` to refresh `dist`, the directory used by the configured static host, before previewing or publishing that copy.

## Included

Eleven systems: Cistercian, Kaktovik, Maya, seven-segment, Kado, Quarter-Circle B16, Square-Segment B16, Rhombus-Segment B16, gate tally, 正 tally, and binary. Shared decimal/hex/binary input, three surfaces, step/count controls, keyed transitions, expanded explain views, and read/choice/build study modes with device-local statistics. Study opens on Cistercian; Quarter-Circle B16 and its beveled, concentric Square-Segment B16 and Rhombus-Segment B16 variants also support all three modes across their 0–15 digit sets. Choice distractors are ranked by structural similarity within the selected notation. Only seven-segment accepts negatives. The prototype caps input at ±999999, Cistercian at 9999, and tally systems at 200.

The landing page has Gallery and Compare tabs. Compare opens a dedicated viewport with four independently selectable systems in a 2×2 grid, remembers the choices on this device, and has a compact HUD for the shared number, surface, and playback. A Gallery button returns to the landing page. Its visible transport supports starting from zero, resuming upward, counting down to zero, pausing, stepping ±1, resetting, and changing speed. Count-up stops at the existing 999999 limit. Open `?view=compare` to start in Compare.

Hover an active segment in Gallery, Compare, or the expanded view to see its meaning, place-value calculation, and relationship to the total. The temporary panel highlights the segment and closes on pointer exit or Escape. Compare and expanded-view segments also support keyboard focus. Explanations distinguish additive marks from strokes that encode a digit together, and stay disabled in Study.

## DEVLOG

The public findings section is sourced from `js/notebook.js` (`devlog`). Add dated entries there as experiments develop. Distinguish encoded facts, observations, and untested hypotheses.

## ROADMAP

The public feature list is sourced from `js/notebook.js` (`roadmap`). Update its Built / Next / Later groups when work lands. The original build brief remains the long-term reference; this proof of concept does not claim completion of its six phases.

## Validation

`npm test` runs deterministic layout, range, unique part identity, encoding uniqueness, round-trip, boundary, and carry checks. The same suite can run at `/tests/index.html` in a browser. Desktop Safari interaction and accessibility-tree paths have been exercised. The gallery-first shell is also checked in Chromium at 1440 × 900 and 390 × 844 for first-viewport fit, Tools disclosure, number updates, and the detail dialog; sustained phone performance measurement remains on the roadmap.

## References

Interaction and glow reference: https://github.com/kai-denrei/dexipurei-galore

Cistercian geometry reference: https://github.com/kai-denrei/CistercianWeave

No reference implementation was copied or vendored. The local Kaktovik image is preserved for continuing visual review; its cumulative five-stroke ladder is also checked against the Unicode specification and encoding proposal in `docs/systems/kaktovik.md`.
