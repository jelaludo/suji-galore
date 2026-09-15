# sūji-galore 数字 galore

A playground proof of concept for visual representations of numbers.

Run `python3 -m http.server 8137` in this directory, then open http://localhost:8137 . No build step, framework, or runtime package dependencies. Optional Google Fonts have system fallbacks.

## Included

Nine systems: Cistercian, Kaktovik, Maya, seven-segment, Kado, Ko, gate tally, 正 tally, and binary. Shared decimal/hex/binary input, three surfaces, step/count controls, keyed transitions, expanded explain views, and read/compose study modes with device-local statistics. Only seven-segment accepts negatives. The prototype caps input at ±999999, Cistercian at 9999, and tally systems at 200.

## DEVLOG

The public findings section is sourced from `js/notebook.js` (`devlog`). Add dated entries there as experiments develop. Distinguish encoded facts, observations, and untested hypotheses.

## ROADMAP

The public feature list is sourced from `js/notebook.js` (`roadmap`). Update its Built / Next / Later groups when work lands. The original build brief remains the long-term reference; this proof of concept does not claim completion of its six phases.

## Validation

`npm test` runs deterministic layout, range, unique part identity, encoding uniqueness, round-trip, boundary, and carry checks. The same suite can run at `/tests/index.html` in a browser. Desktop Safari interaction and accessibility-tree paths have also been exercised; narrow-phone visual review and sustained performance measurement remain on the roadmap.

## References

Interaction and glow reference: https://github.com/kai-denrei/dexipurei-galore

Cistercian geometry reference: https://github.com/kai-denrei/CistercianWeave

No reference implementation was copied or vendored. The local Kaktovik image is preserved for a later geometry review.
