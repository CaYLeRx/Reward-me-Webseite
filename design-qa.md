# Design QA — Scroll-reactive star background

Date: 2026-07-17

## Comparison target

- Source visual truth: `D:/CodeX/work/reward-me-website-migration/qa-star-source-desktop.png`
- Desktop implementation: `D:/CodeX/work/reward-me-website-migration/qa-star-local-desktop.png`
- Scrolled implementation: `D:/CodeX/work/reward-me-website-migration/qa-star-local-scrolled.png`
- Mobile implementation: `D:/CodeX/work/reward-me-website-migration/qa-star-local-mobile.png`
- Mobile dark mode: `D:/CodeX/work/reward-me-website-migration/qa-star-local-mobile-dark.png`
- Desktop viewport: 1440 × 900, German, light mode, home route
- Mobile viewport: 390 × 844, German, light and dark mode, home route

## Full-view comparison evidence

The original deployment and revised local implementation were displayed together at the same desktop viewport. The page composition, hero proportions, navigation, typography and product mockup remain aligned. The intentionally removed left-side thread decoration is absent, while the new starfield adds depth without obscuring text or controls.

The implementation was also captured after 720 px of scrolling. Near, middle and far particles visibly change scale and position while the fixed header and section content remain stable.

## Focused comparison evidence

A separate cropped comparison was not needed because the change is a global background treatment and the full desktop and mobile captures show the affected surface at readable scale. The unchanged logo, typography, buttons and device mockup were checked in the full-view images.

## Required fidelity surfaces

- Fonts and typography: unchanged Inter/Fraunces files, weights, hierarchy and wrapping; no new font drift.
- Spacing and layout rhythm: unchanged. The removed fixed decoration did not occupy layout space. No new overflow was found.
- Colors and visual tokens: star colors derive from Reward Me emerald, cream and champagne tones. Light and dark variants preserve readable contrast.
- Image quality and asset fidelity: logo, favicon and product mockup remain unchanged and sharp. No source asset was replaced.
- Copy and content: unchanged across the tested German route.

## Findings

- P0: none
- P1: none
- P2: none

## Interaction and technical checks

- Scroll depth tested from 0 to 720 px.
- Desktop and mobile particle density tested.
- Dark-mode palette change tested.
- Reduced-motion handling implemented with a static render.
- Legacy left-side thread removed from all 32 route/locale templates.
- Browser console checked: no application errors or warnings.
- Production build completed successfully.

## Comparison history

First comparison passed with no actionable P0/P1/P2 findings, so no corrective design iteration was required.

## Follow-up polish

No blocking follow-up. Particle density and glow strength can be tuned later as a subjective brand preference.

final result: passed
