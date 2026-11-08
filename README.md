# QUBO — Institutional Web Engine

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Three.js

Type: Source Serif 4 (headlines) · IBM Plex Sans (body) · JetBrains Mono (telemetry)

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Structure

```
app/
  layout.tsx                    Global layout, fonts, ParticleBackground (cursor aura + particle physics)
  page.tsx                      Home: topology hero, black hole screen, metrics, ticker, page directory
  ecosystem/ infrastructure/ research/ security/ careers/   One page per section
  globals.css                   Design tokens (@theme) + scan/line-draw card interactions
  products/[slug]/page.tsx      Engine detail page (flow diagram, specs grid, launch CTA) — no telemetry bar
  products/[slug]/console/page.tsx  Engine console workspace (simulated live session)
components/
  BlackHoleCanvas.tsx           WebGL black hole: lensed accretion disk, photon ring, bent starfield
  PageIntro.tsx / EngineGrid.tsx  Shared section-page shell and engine cards
  QuantumMeshCanvas.tsx         Three.js topology mesh — GLSL surface, floating nodes, cursor ripples
  ParticleBackground.tsx        Velocity-reactive background particles + radial cursor aura
  ProductFlowDiagram.tsx        Animated SVG flows: Valtrius / Qubex / Synatra
  TelemetryTicker.tsx           500ms simulated telemetry marquee (home only)
  SiteHeader.tsx / SiteFooter.tsx  Header nav, footer with live system-status line
  EngineConsole.tsx             Console UI with streaming logs and commands
lib/
  products.ts                   Single source of truth for engine copy and specs
```

## Notes

- All telemetry, fills and signals are **simulated** client-side. Replace the intervals in
  `TelemetryTicker`, `SiteFooter`, `ProductFlowDiagram` and `EngineConsole` with your websocket / API feeds.
- Product copy and spec numbers live in `lib/products.ts` — they are illustrative placeholders; edit before launch.
- The footer contact link is a placeholder (`contact qubogroupllc@gmail.com`).
- Animations respect `prefers-reduced-motion`.
- Using Tailwind v3? Move the `@theme` tokens in `globals.css` into `tailwind.config.ts` under `theme.extend`.
