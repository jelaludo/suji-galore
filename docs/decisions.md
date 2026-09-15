# Prototype decisions · 2026-09-15

- Keep authored static source at the repository root, following the supplied brief. Hosting packages a mechanical copy in `dist/`; local use requires no build step.
- Keep the enlarged view as a native dialog for this milestone. Separate view URLs, exports, full skin simulation, PWA, and component API are deferred.
- Cistercian is single-glyph 0–9999 for this prototype. A bare stem means zero. Multi-glyph extension remains future work.
- Part identity and geometry are separate fields; the renderer reconciles IDs and updates path geometry. Added line parts draw in, removed parts retract or leave a nixie afterglow, and adjacent positional carries stagger outward from the units place. Moving-part interpolation remains deferred.
- Kado frames remain visible for every cell. Quarter-Circle B16 retains the internal id `ko`; it has a top radial tick for an empty positional ring and a centre dot for the value zero. These are experimental reading aids.
- Public DEVLOG and ROADMAP use `js/notebook.js` as the source of truth. There is no in-browser content editor or backend.
- No quantitative claims about perceptual legibility or mobile performance are made. Structural encoding tests are not human research.
- Kaktovik uses an original straight-stroke interpretation of the supplied reference sheet and the Unicode chart. Stable part identities take priority over imitating the exact outline of a particular font.
- Study includes typed reading, structure-matched multiple choice, and exact composition. Statistics are local to a browser and split by system and mode. Adaptive difficulty and aggregate research remain deferred.
- Optional WebMCP registration is feature-detected. No supported WebMCP validation context was available in this session; its contract remains unverified in a real supporting browser.
