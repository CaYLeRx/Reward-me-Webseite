# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Visual direction

- Keep the starfield intentionally intense: use ten times the original baseline density and pronounced depth/parallax while scrolling.
- In dark mode, stars and border sparkles use emerald, champagne, and cream light. In light mode, invert the effect to black and deep near-black tones.
- Rounded content cards and bordered boxes should have animated sparkle points moving along their edges without reducing text readability.
- Border sparkle, glow and ambient depth effects must run continuously while the page is idle; scrolling may intensify them but must never be required for visible motion.
- Respect `prefers-reduced-motion` and keep the effect performant on mobile devices.
