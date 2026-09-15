// This is the single source for the public DEVLOG and ROADMAP sections.
export const devlog=[{date:'2026-09-15',title:'001 / The first playground',paragraphs:[
  'Built: six representations of a shared number, three surfaces, count up/down, single-step controls, and an expanded reading guide. Everything runs as native JavaScript and SVG, with no build step or runtime package dependencies.',
  'Observed in the encoding: 15 → 16 removes four active binary bits and adds one. Ink quantity is not a reliable proxy for magnitude in a positional system. Whether this feels confusing is a question for people, not something the code alone can answer.',
  'Design finding: an empty inner Ko ring needs an explicit position marker. This prototype uses a short tick for a zero digit; the value zero itself remains a centre dot. We should compare this convention with faint complete guide rings.',
  'Reference review: dexipurei-galore supplies the shared-input/card/full-view interaction precedent and orange glow vocabulary. CistercianWeave confirms the quadrant geometry. No sibling source was vendored. Kaktovik is pending a geometry review.',
  'Not yet measured: reading speed, accuracy, perceived similarity, phone frame rate, and the effect of skin on legibility. Animation currently fades in added parts and removes departing parts immediately; afterglow, moving parts, and carry cascades remain future work.'
]}];
export const roadmap=[
  {status:'BUILT · PROOF OF CONCEPT',title:'A shared playground',items:['Six systems: Cistercian, seven-segment, Kado, Ko, tally, binary','Ink, nixie glow, and blueprint surfaces','Shared input, stepping, counting, and explain view','DEVLOG and ROADMAP as editable project content']},
  {status:'NEXT · LEARN & REFINE',title:'Make the differences tangible',items:['Verify Kaktovik geometry from the supplied image and Unicode chart','Add Maya and 正 tally with documented conventions','Read and compose quizzes with local statistics','Ghost parts, exit afterglow, and carry animation','Mobile browser testing, accessibility review, and performance measurements']},
  {status:'LATER · EXPAND THE LAB',title:'Measure, then invent',items:['Timer and ammo experiments; test positional carry against erosion','Extended historical catalog and source notes','Geometry-aware similarity and measured reading experiments','Embeddable display component and offline support','Forge: design, save, compare, and export original systems']}
];
