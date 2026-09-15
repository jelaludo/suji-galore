# Prototype decisions · 2026-09-15

- Keep authored static source at the repository root, following the supplied brief. Hosting packages a mechanical copy in `dist/`; local use requires no build step.
- Implement a bounded playground slice instead of declaring full Phase 1–2 completion. The enlarged view is a native dialog; separate view URLs, quiz, exports, full skin simulation, PWA, and component API are deferred.
- Cistercian is single-glyph 0–9999 for this prototype. A bare stem means zero. Multi-glyph extension remains future work.
- Part identity and geometry are separate fields; the renderer reconciles IDs and updates path geometry. Added parts fade in; removed parts currently disappear. Moving-part interpolation, exit effects, and carry cascades are not implemented yet.
- Kado frames remain visible for every cell. Ko has a top radial tick for a zero place and a centre dot for the value zero. These are experimental reading aids.
- Public DEVLOG and ROADMAP use `js/notebook.js` as the source of truth. There is no in-browser content editor or backend.
- No quantitative claims about perceptual legibility or mobile performance are made. Structural encoding tests are not human research.
- Optional WebMCP registration is feature-detected. No supported WebMCP validation context was available in this session; its contract remains unverified in a real supporting browser.
