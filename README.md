# sūji-galore 数字 galore

A gallery-first playground for visual representations of numbers. Its initial viewport gives the available space to the glyphs; navigation, motion, surfaces, and transition presets remain compact or disclosed on demand.

Run `python3 -m http.server 8137` in this directory, then open http://localhost:8137 . No build step, framework, or runtime package dependencies. Optional Google Fonts have system fallbacks.

## Included

Nine systems: Cistercian, Kaktovik, Maya, seven-segment, Kado, Quarter-Circle B16, gate tally, 正 tally, and binary. Shared decimal/hex/binary input, three surfaces, step/count controls, keyed transitions, expanded explain views, and read/choice/build study modes with device-local statistics. Study opens on Cistercian; Quarter-Circle B16 also supports all three modes across its 0–15 digit set. Choice distractors are ranked by structural similarity within the selected notation. Only seven-segment accepts negatives. The prototype caps input at ±999999, Cistercian at 9999, and tally systems at 200.

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
