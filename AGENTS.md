# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Visual direction

- Replace individual star sprites with a v0-inspired 3D dotted terrain: dense, structured point waves with pronounced depth, but no recognisable star shapes.
- In dark mode, the terrain is predominantly graphite and pearl with restrained emerald and champagne accents. In light mode, invert it to graphite and near-black dots.
- Deliver the dotted terrain as a muted, inline H.264 loop with a static poster fallback for browsers or settings that cannot play video. Keep separate light and dark assets, and show only the poster when reduced motion is requested.
- Rounded content cards and bordered boxes should have animated sparkle points moving along their edges without reducing text readability.
- Border sparkle, glow and ambient depth effects must run continuously while the page is idle; scrolling may intensify them but must never be required for visible motion.
- Respect `prefers-reduced-motion` and keep the effect performant on mobile devices.
