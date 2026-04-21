---
title: "The Making of My AInalytics Garden: Engineering a Documentation Ecosystem"
date: 2026-04-21
category: "Data Architecture"
keyword: "AutoDocumentation"
id: "05/01"
author: "Gabriella Pinheiro"
status: "Draft 🌿"
excerpt: "How I engineered a passive documentation ecosystem in a single session — the architectural decisions, the SVG botany engine, and the Reporter-Editor framework that now turns my terminal sessions into published knowledge."
---

## The Problem I Refused to Accept

There is a specific kind of professional frustration that data practitioners rarely talk about publicly: the gap between what you build and what you document. Not because documentation is hard — it isn't, technically. But because it requires a **context switch** that competes with the most valuable resource a Data Lead has: uninterrupted execution time.

My situation in April 2026 was representative. I was leading a team of 13 at FGV — Data Scientists, Data Engineers, Researchers, Performance Media specialists — while simultaneously completing an MBA in AI & Analytics. My days moved between strategic governance decisions, technical architecture reviews, and hands-on engineering sprints across three active repositories:

- `edu-expansion-intelligence` — An MLOps + GenAI pipeline for educational market intelligence (my MBA TCC)
- `AI-exploratory` — Personal research on Claude adoption patterns via the Anthropic Economic Index
- `portfolio-ml` — Production-grade people analytics and ML experiments

Each repository was generating genuine insights daily. Architectural decisions in dbt that deserved explanation. Model performance findings that warranted analysis through an economics lens. GenAI adoption data that held implications beyond the analysis itself.

None of it was being documented publicly. Not because I lacked the knowledge to write about it — but because documentation felt like a second job. I needed a system where **documentation was a byproduct of engineering, not a separate activity**.

That is what this garden is.

---

## The Architecture: Three Layers of Intelligence

The My AInalytics Garden is built on a three-layer architecture I call the **Reporter-Editor Framework**, implemented with Claude Code as the orchestration layer and Astro as the static publishing engine.

### Layer 1 — The Hub: Astro as Static Engine

The choice of Astro was deliberate and non-negotiable. Performance is not a luxury for a professional knowledge base — it is a signal. A site that loads in 80ms communicates something about the engineer who built it. Astro's island architecture produces zero-JavaScript pages by default, with CSS and HTML as the primary rendering surface.

The full project structure:

```
src/
  components/
    DandelionPlant.astro    ← GenAI — radial text petals
    LavenderPlant.astro     ← MLOps — alternating stem text
    TulipPlant.astro        ← Data Architecture — tulip shape
    BotanicalCard.astro     ← auto-selects plant by category
  content/
    config.ts               ← Zod schema validation
    drafts/                 ← staged posts, never rendered
    garden/                 ← published posts, always rendered
  layouts/
    BaseLayout.astro        ← header + glassmorphism sidebar + footer
  pages/
    index.astro             ← garden grid
    garden/[slug].astro     ← individual post pages
  styles/
    global.css              ← full design system
```

The `src/content/config.ts` uses Astro's Content Collections API with Zod schema validation — every post must declare `title`, `date`, `category`, `keyword`, and `id`. The schema enforces the category enum (`GenAI | MLOps | Data Architecture`) at build time, making it impossible to publish a post that doesn't map to a botanical plant type.

### Layer 2 — The Sentinels: Claude Code as Distributed Reporter

In each of my three primary repositories, a `.claude/commands/done.md` file defines a `/done` slash command. When I reach a technical milestone in any project, I type `/done` in that repo's Claude Code session.

The command triggers a precise sequence:

1. `git diff HEAD --stat` — surfaces what changed
2. `git diff HEAD` — full patch for semantic analysis
3. Claude extracts two information layers: **Technical Achievement** (the "how") and **Managerial Perspective** (the "why")
4. Category is auto-assigned based on the nature of the change
5. A `keyword` is derived — one word that captures the core concept, destined for the SVG petals
6. A structured `.md` file is written to `C:\meu-digital-garden\src\content\drafts\`

The three sentinel configurations differ by project context. The `edu-expansion-intelligence` sentinel understands dbt staging models and Vertex AI pipeline stages. The `portfolio-ml` sentinel speaks XGBoost, SMOTE, and people analytics. The `AI-exploratory` sentinel frames findings through the lens of GenAI adoption patterns and economic indices. Each CLAUDE.md is a specialized domain briefing.

### Layer 3 — The Governance Gate: Human Review Before Publishing

The drafts folder is the **governance layer** of the system. As a Data Lead at the 3rd most influential think tank in the world, professional discretion is not optional. Auto-generated content could inadvertently expose organizational strategy, reference confidential projects, or adopt a tone inconsistent with my public positioning.

The workflow enforces a deliberate review step:

```
/done in sentinel repo
        ↓
src/content/drafts/YYYY-MM-DD-[slug].md
        ↓  (manual review + edit if needed)
src/content/garden/[slug].md
        ↓  (git push to main)
Vercel auto-deploy → live in ~30 seconds
```

Moving a file from `drafts/` to `garden/` is the publish action. No buttons. No CMS interface. No deployment pipeline to configure. The Astro build reads only the `garden/` collection; the `drafts/` collection is schema-validated but never rendered. The governance gate is the filesystem itself.

---

## The Design System: Glassmorphism Meets Botanical Data

The visual identity of the garden was designed around one constraint: it must read as a **professional knowledge base, not a blog**. The reference was valeriiakuka.com's approach to personal publishing — minimal, typographically precise, with a distinct artistic identity.

The design system:

| Token | Value | Rationale |
|---|---|---|
| Background | `#fcfaf6` | Warm off-white — evokes paper, reduces cognitive load |
| Text main | `#2d2d2d` | Near-black, not pure black — softer contrast |
| Text muted | `#857f76` | Secondary content, dates, categories |
| Accent green | `#7a8c71` | Botanical stems — anchors the garden metaphor |
| Dandelion | `#d97a8a` | GenAI — warm rose, energy and emergence |
| Lavender | `#827397` | MLOps — methodical purple, systematic thinking |
| Tulip | `#c48b52` | Data Architecture — amber, structural warmth |

Typography uses Gotham as the primary reference (commercial license), with `Space Grotesk` and `Space Mono` as the Google Fonts implementation — matching Gotham's geometric humanist character without requiring a license file in the repository.

The glassmorphism sidebar (`backdrop-filter: blur(3px)`) activates on the hamburger menu, revealing the README.md panel with professional context. It's CSS-only — no JavaScript framework, no animation library.

### The SVG Botanical Engine: Keywords as Visual Identity

The most distinctive design decision is the **keyword-driven SVG plant engine**. Each card's botanical illustration is not decorative — it is semantic.

A post about SQL gets petals that spell `SQL`. A post about `Medallion` architecture grows a tulip whose petals read `Medallion`. The keyword in the frontmatter is literally the visual content of the illustration.

The three plant types are Astro components that accept a single `keyword` prop:

**DandelionPlant** (GenAI) generates 15 text petals radiating at 30° increments from a central anchor point, each repeating the keyword three times: `${keyword} ${keyword} ${keyword}`. The radial symmetry mirrors a dandelion's seed head — fitting for GenAI, where ideas disperse in all directions simultaneously.

**LavenderPlant** (MLOps) places the keyword text alternating left and right along a vertical stem, with slight rotation increments that create the characteristic lavender spike silhouette. MLOps is systematic, sequential, and disciplined — the lavender's controlled repetition reflects that.

**TulipPlant** (Data Architecture) arranges keyword text in a tulip-shaped cluster: center top, flanking pairs diverging outward, inner column for depth. Data architecture is about structure, layers, and deliberate form — the tulip's defined geometry reflects that.

The SVG is rendered server-side by Astro. No client-side JavaScript renders these illustrations. They are static HTML with embedded SVG — as fast as possible, as accessible as SVG text permits.

---

## The Workflow in Practice: What `/done` Actually Does

This post is itself a demonstration of the workflow. I am writing it in `src/content/drafts/making-of-garden.md`. It will not appear on the public site until I manually move it to `src/content/garden/`. That move is a deliberate editorial decision.

The full lifecycle for a sentinel-generated post from `edu-expansion-intelligence`:

```bash
# In C:\edu-expansion-intelligence after a dbt milestone
/done

# Claude Code runs:
# git diff HEAD --stat → 3 files changed: stg_rais_vinculos.sql, schema.yml, ...
# git diff HEAD → [full patch]
# → Generates: 2026-04-21-rais-staging-optimization.md
# → Saves to: C:\meu-digital-garden\src\content\drafts\

# I review the draft, adjust tone, verify no confidential data
# Move to garden/:
mv src/content/drafts/2026-04-21-rais-staging-optimization.md \
   src/content/garden/

# Commit and push:
git add src/content/garden/2026-04-21-rais-staging-optimization.md
git commit -m "publish: RAIS staging optimization insights"
git push origin main

# Vercel detects push → builds → deploys in ~30s
# New tulip card appears on the garden grid
```

The total human time investment for publishing a technical insight: under 5 minutes, including review. The documentation trap — where engineering velocity outpaces documentation capacity — is broken.

---

## What This Is Really About

My MSc in Economics at UFF introduced me to the concept of **total factor productivity** — the portion of output growth that cannot be explained by increases in capital or labor alone. TFP captures the residual: better processes, better knowledge, better institutional capacity.

A data professional's TFP lives in their documented decisions. The architecture choices they made and why. The models they rejected and the reasoning behind the rejection. The economic framing they brought to a technical problem.

Without documentation, that TFP is private — or worse, ephemeral. It lives in Slack threads and terminal sessions and evaporates when the project ends or the team changes.

The AInalytics Garden is a **TFP externalization system**. Not a portfolio designed to impress recruiters. Not a blog designed to accumulate followers. A professional knowledge infrastructure designed to make the reasoning behind 8+ years of analytical practice publicly searchable and institutionally durable.

It is not finished. No garden ever is.

But it is growing.
