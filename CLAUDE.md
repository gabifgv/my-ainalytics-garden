# CLAUDE.md — my AInalytics Garden

Lead Software Engineer persona. This is Gabriella Pinheiro's professional "Insights Catalog" — a static site powered by Astro that auto-publishes technical learnings as botanical SVG cards. Goal: automated documentation ecosystem, not a portfolio.

## Project identity

- **Brand:** `my AInalytics garden`
- **Author:** Gabriella Pinheiro — Manager of Data Intelligence & Analytics at FGV, team of 13
- **Stack:** Astro 4.x · TypeScript · Vanilla CSS (no Tailwind)
- **Deploy:** Vercel (auto-deploy on push to `main`)
- **Live URL:** https://my-ainalytics-garden.vercel.app

## Design system (DO NOT change)

| Token | Value |
|---|---|
| Background | `#fcfaf6` |
| Text main | `#2d2d2d` |
| Text muted | `#857f76` |
| Stem / accent green | `#7a8c71` |
| Dandelion (GenAI) | `#d97a8a` |
| Lavender (MLOps) | `#827397` |
| Tulip (Data Architecture) | `#c48b52` |

Fonts: Gotham (commercial) with `Space Grotesk` + `Space Mono` as Google Fonts fallbacks.

## Content workflow (Approval Gate)

```
Cross-project /done  →  src/content/drafts/   (staged, NOT built)
                              ↓ manual review
                         src/content/garden/   (built & published)
```

- **`src/content/drafts/`** — Landing zone for auto-generated posts from sentinel repos. Astro schema validates them but they are never rendered publicly.
- **`src/content/garden/`** — Production posts. Only content here is served.
- To publish a draft: move the `.md` file from `drafts/` to `garden/`. That's all.

## Botanical SVG Engine (category → plant)

| Category frontmatter | Plant component | Color |
|---|---|---|
| `GenAI` | `DandelionPlant.astro` | `#d97a8a` |
| `MLOps` | `LavenderPlant.astro` | `#827397` |
| `Data Architecture` | `TulipPlant.astro` | `#c48b52` |

The `keyword` frontmatter field drives the petal text. A post about SQL gets petals that spell "SQL".

## Frontmatter schema (required)

```markdown
---
title: "Post Title"
date: YYYY-MM-DD
category: "GenAI"           # must be GenAI | MLOps | Data Architecture
keyword: "SingleWord"       # used as petal text in the SVG
id: "XX/YY"                 # sequence number (optional but preferred)
author: "Gabriella Pinheiro"
status: "Live 🌱"
excerpt: "One sentence summary."
---
```

## Common commands

```bash
npm run dev      # dev server at localhost:4321
npm run build    # production build → dist/
npm run preview  # preview the build locally
```

## File structure

```
src/
  components/
    DandelionPlant.astro   # GenAI plant — radial text petals
    LavenderPlant.astro    # MLOps plant — alternating stem text
    TulipPlant.astro       # Data Architecture plant — tulip shape
    BotanicalCard.astro    # Card wrapper — auto-selects plant by category
  content/
    config.ts              # Astro collection schemas
    drafts/                # Staged posts (not rendered)
    garden/                # Published posts (rendered)
  layouts/
    BaseLayout.astro       # Header + sidebar + footer shell
  pages/
    index.astro            # Garden grid
    garden/[slug].astro    # Individual post
  styles/
    global.css             # Full design system CSS
public/
  favicon.svg
```

## Sentinel integration

Three repositories automatically export drafts here via `/done`:
- `C:\edu-expansion-intelligence` — dbt/GCP/MLOps capstone
- `C:\AI-exploratory` — Anthropic economic index & LLM research
- `C:\portfolio-ml` — People analytics & ML experiments

Each sentinel exports to `C:\meu-digital-garden\src\content\drafts\` using the format `YYYY-MM-DD-[topic-slug].md`.
