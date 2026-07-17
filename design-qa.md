# Design QA — Reward Me Website Copy

Date: 2026-07-17

## Scope

- Reference: current public `www.reward-me.ch` capture
- Prototype: `http://localhost:4173`
- Viewports: 1440 × 900 and 390 × 844
- Routes: `/`, `/kontakt`, `/ueber-uns`, `/partner`, `/rewards`, `/agb`, `/datenschutz`, `/impressum`
- States: light, dark, German, English, French, Italian, mobile menu open/closed, contact validation

## Evidence reviewed

- Original and prototype desktop hero screenshots were compared together at the same viewport and state.
- Original and prototype contact page screenshots were compared together at the same viewport and scroll position.
- Mobile closed/open navigation, responsive hero, English content and dark mode were inspected in the browser.
- Every route returned its expected title, H1 and main landmark.
- Browser console contained no errors or warnings from the application.
- Production build completed successfully.

## Findings

- P0: none
- P1: none
- P2: none
- P3: none required for the migration handoff

The clone uses the captured source DOM, exact source CSS, local copies of the logo, favicon and font files, and recreates the source interactions without hotlinked visual assets.

final result: passed
