# Mr. Transaction Engineer — immersive 3D site

Next.js 16 · React 19 · React Three Fiber · three · GSAP ScrollTrigger · Lenis.
One continuous, scroll-controlled camera journey (19 stations, 7 chapters) with a hybrid
HTML layer: every fact on the site also exists as crawlable HTML below the journey.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Before launch — things only you can supply (all in `src/lib/content.ts`)

| Slot | Why it's empty |
|---|---|
| `REGISTER_URL` | The source page was unreachable from the build environment. It defaults to the existing funnel page; set `NEXT_PUBLIC_REGISTER_URL` to the exact Kajabi registration destination. |
| `ASSETS.eddiePhoto` / `eddieVideo` | Real approved assets only. Drop files in `public/assets/` and set the path. Until then the portrait slot shows a neutral "ER" mark — no generated face. |
| `PROOF[]` | Real testimonials only. While empty, the proof section is **not rendered**. |
| Strategy descriptions | Written as general, non-promissory definitions. Replace with approved course copy where it differs. |
| `FOOTER_LINKS` | Privacy / Terms / contact / social destinations. |
| `og:image` | Add an approved still in `src/app/layout.tsx`. |
| Resource previews | `ResourceDialog` has a marked slot for approved screenshots / video / document previews. |

Credentials (22+ years, 1,100+ deals) and the nine strategy names / summit curriculum are taken from the brief.
The Deal Analyzer visualization is labelled *hypothetical illustration* and uses no real figures.

## How it works

- `src/lib/journey.ts` — stations (camera position + look-at per scene), chapters, and the scroll **beats**
  (which statements show at which point). Edit the story here.
- Scroll → `ScrollTrigger` progress → `progressToS()` (per-leg ease with a dwell plateau so the camera rests at
  each station) → damped `journey.s` → `CameraRig` spline + every scene reads the same value.
- `Stage` mounts/hides each scene by distance from the camera. Mobile uses fewer instances, lower DPR,
  no AA, a wider FOV/camera offset.
- `DealViz` is the reusable deal visualization (seller / property / mortgage / investor / buyer / cash / cash flow /
  equity / terms / contract / exit joined by animated lines). Each strategy is just a graph in `content.ts`.
- Accessibility: canvas is `aria-hidden`; beats are decorative duplicates of real HTML; skip link, keyboard-reachable
  dialogs (Esc closes), `MOTION: OFF` toggle plus `prefers-reduced-motion`, WebGL-less fallback message.
- 3D type uses self-hosted Inter TTFs in `public/fonts` (no CDN lookups). Keep 3D strings to Latin characters
  (no arrows / dashes) or troika will try to fetch fallback fonts.

## Not done / next
- Real photo/video, testimonials and generated cinematic plates (Higgsfield / Veo etc.) — none supplied; scenes are procedural geometry.
- Post-processing (bloom, DOF) deliberately skipped for performance; add behind a desktop-only flag if wanted.
- Cross-device QA (Safari/iOS/Android, throttled networks) — only desktop & mobile-emulated Chromium on software GL were tested.
