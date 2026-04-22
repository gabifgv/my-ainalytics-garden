---
title: "The Making of My AInalytics Garden: Engineering a Documentation Ecosystem Step by Step"
date: 2026-04-21
category: "Data Architecture"
keyword: "AutoDocument"
id: "0005"
flower_type: "lavender"
author: "Gabriella Pinheiro"
excerpt: "A full step-by-step breakdown of how I built an automated knowledge publishing system using Astro, Claude Code, and a botanical SVG engine — from zero to live in one afternoon."
---

## The Problem I Refused to Accept

There is a specific kind of professional frustration that data practitioners rarely talk about publicly: the gap between what you build and what you document. Not because documentation is hard — it isn't, technically. But because it requires a **context switch** that competes with the most valuable resource a Data Lead has: uninterrupted execution time.

My situation in April 2026 was representative. I was leading a team of 13 at FGV while completing an MBA in AI & Analytics. Three active repositories were generating genuine insights daily — architectural decisions in dbt that deserved explanation, model performance findings worth framing through an economics lens, GenAI adoption patterns with implications beyond the analysis itself. None of it was reaching a public knowledge base.

I needed a system where **documentation was a byproduct of engineering, not a separate activity**. So I built one, in a single afternoon session, using Claude Code as my pair programmer.

This is the full step-by-step of how.

---

## How I Used Claude Code

Every step in this build was orchestrated through **Claude Code** — Anthropic's CLI tool that runs directly in the terminal, with full access to the filesystem and git history. Claude Code operates with persistent context through `CLAUDE.md` files placed at the root of each repository, giving it a specific persona and set of constraints per project.

The workflow was conversational but precise. I gave a prompt, reviewed the output, caught issues, and iterated — in natural language, not config files. For a full-stack build of this complexity — Astro framework, TypeScript schema validation, SVG botanical engine, multi-repo sentinel configuration — having Claude Code handle scaffolding while I focused on architectural decisions is exactly the "collaborative intelligence" pattern I've researched through the Anthropic Economic Index.

What follows are the key prompts I used, organized by build phase.

---

## Phase 1: Initializing the Astro Hub

The garden's central publishing engine is an Astro 4.x static site. I started from a plain HTML prototype and gave Claude Code this initialization prompt:

```
Initialize an Astro 4.x project in this directory. Stack:
- TypeScript in strict mode
- Vanilla CSS only — no Tailwind, no component libraries
- Google Fonts: Space Grotesk (300, 400, 500) + Space Mono
- Deploy target: Vercel static output
- No client-side JavaScript by default

Create this folder structure:
src/
  components/     ← botanical SVG components + card wrapper
  content/
    config.ts     ← Astro Content Collections with Zod schema
    drafts/       ← staging zone, never rendered publicly
    garden/       ← production posts, always rendered
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    garden/[slug].astro
  styles/
    global.css
public/
  favicon.svg
```

Claude Code generated the full scaffold including `astro.config.mjs`, `tsconfig.json`, and `package.json` with the correct Astro 4.x dependencies. After `npm install`, the first build ran cleanly: **6 pages in 1.26 seconds**.

---

## Phase 2: Locking the Data Contract with Zod

Before writing any component, I locked down the data contract. Every post must satisfy a Zod schema in `src/content/config.ts`. My prompt:

```
Create src/content/config.ts using Astro Content Collections API.
Define postSchema with:

Required:
- title: string
- date: coerced date
- category: enum — exactly ['GenAI', 'MLOps', 'Data Architecture']
- keyword: string (drives SVG petal text — keep it one word, max 12 chars)

Optional:
- flower_type: enum for manual plant override (values TBD)
- id: string (sequence number like "01/01")
- status, author, excerpt: string

Export two collections:
- garden: full schema, all required fields enforced
- drafts: all fields partial (for staged, incomplete posts)
```

The enum constraint on `category` is enforced at **build time** by Astro's content validation. A post that declares `category: "SQL"` fails the build. The governance contract lives in code, not in convention.

---

## Phase 3: The Botanical SVG Engine

The most distinctive architectural decision is the **keyword-driven SVG plant engine**. Each card's botanical illustration is not decorative — it is semantic. The keyword in the frontmatter literally becomes the visual content of the illustration. A post about SQL grows petals that spell `SQL`. A post about `Medallion` architecture grows a tulip whose petals read `Medallion`.

I built three SVG components, one per category. The prompt pattern was consistent:

**DandelionPlant.astro — GenAI (#d97a8a):**
```
Create DandelionPlant.astro — a server-side only SVG component.
Props: keyword (string).
Generate 15 text petals, each radiating at 24-degree increments from a 
center anchor at (cx=100, cy=110). Each petal contains: "${keyword} ${keyword} ${keyword}".
Apply rotation via transform="rotate(angle, 100, 110)".
Color: #d97a8a. Font: Space Mono, 7px. No client JavaScript.
```

**LavenderPlant.astro — MLOps (#827397):**
```
Create LavenderPlant.astro — server-side SVG.
Props: keyword (string).
Place the keyword alternating left/right along a vertical stem (y=20 to y=140).
Each instance slightly rotated (-15° left, +15° right).
Draw the stem as an SVG line. Color: #827397. Font: Space Mono, 6px.
```

**TulipPlant.astro — Data Architecture (#c48b52):**
```
Create TulipPlant.astro — server-side SVG.
Props: keyword (string).
Arrange the keyword in a tulip-shaped cluster: one centered at top, 
flanking pairs diverging outward below, an inner column for depth.
Draw a closed tulip outline in SVG path. Color: #c48b52. Font: Space Mono, 7px.
```

The plant shapes were chosen deliberately. The Dandelion's radial dispersion mirrors GenAI — ideas spreading in all directions simultaneously. The Lavender's controlled sequential repetition reflects MLOps discipline. The Tulip's defined geometry maps to Data Architecture's structural nature.

All three render server-side. No client JavaScript touches the SVG.

---

## Phase 4: BotanicalCard and the flower_type Override System

`BotanicalCard.astro` is the card wrapper that auto-selects the appropriate plant. The initial version used category as the sole selector. In a second build session, I introduced the `flower_type` override — a frontmatter field that lets any post bypass the category default:

```
Update BotanicalCard.astro to implement priority logic:
1. If flower_type frontmatter is set, use it — it wins over category.
2. If flower_type is absent, fall back to category default:
   GenAI → dandelion, MLOps → lavender, Data Architecture → tulip

Also update config.ts: add flower_type as an optional enum.
Current valid values: dandelion, lavender, tulip, rose, sunflower, 
wheat, bamboo, coral, ginkgo, cosmos, thistle, lotus, cactus.
```

During this phase, the first bug appeared: conditional rendering in Astro with the override logic wasn't working. The BotanicalCard was defaulting to a single plant regardless of the selected type. The fix required switching from a dynamic component lookup to explicit conditional rendering:

```
The current BotanicalCard.astro is not switching plants dynamically.
The issue is that Astro can't dynamically resolve component imports at runtime.
Fix: use explicit conditionals:
{activeFlower === 'dandelion' && <DandelionPlant keyword={keyword} />}
{activeFlower === 'lavender' && <LavenderPlant keyword={keyword} />}
...and so on for each registered plant.
```

This is a known Astro constraint: component resolution must be static at build time. The fix is explicit, not dynamic. The commit message for that fix was `fix: forcing dynamic botanical selection` — which is technically a misnomer, since what we actually implemented is static conditional selection. The lesson: when building with Astro, embrace static patterns.

---

## Phase 5: Expanding the Botanical Library

With the override system in place, I extended the library from 3 to 13 plant types. Each new plant was prompted with its visual analogy and color:

```
Create these new SVG components. Each: server-side only, accepts keyword prop.

WheatPlant     #d4a04a  keyword as grains on diverging stalks from a base
BambooPlant    #3a7d44  keyword stacked in tight vertical segments with joints
CoralPlant     #e07a5f  keyword branching asymmetrically like underwater coral
GinkgoPlant    #b8860b  keyword in fan-shaped leaf clusters at branch tips
CosmosPlant    #c87fb8  keyword in concentric orbital rings
ThistlePlant   #6b5e9e  keyword spiked outward from a dense central sphere
LotusPlant     #c05070  keyword in concentric petal layers, symmetric
CactusPlant    #4d7c3f  keyword on thick vertical segments with branching arms

Register each in: BotanicalCard.astro (as explicit conditional) and 
index.astro (in the flowerMeta record with color and label).
Also add all to the flower_type enum in config.ts.
```

The library now covers 13 plant types. The frontmatter `flower_type` field, when set, lets any post declare its exact visual identity independently of its analytical category.

---

## Phase 6: The Governance Gate

The most important architectural decision has nothing to do with code — it is the **two-folder content workflow**:

```
/done in sentinel repo
        ↓
src/content/drafts/YYYY-MM-DD-[slug].md   ← auto-generated, never rendered
        ↓  (manual editorial review)
src/content/garden/[slug].md              ← published, always rendered
        ↓  git push origin main
Vercel build → live in ~30 seconds
```

The `drafts/` folder is schema-validated by Astro but **never rendered publicly**. As a Data Lead at a research institution, auto-publishing organizational work without review is not an option. The review step is where I verify that no confidential data leaked, the tone aligns with my public positioning, and the technical content is accurate.

Moving a file from `drafts/` to `garden/` is the entire publishing action. No CMS. No button. The governance gate is the filesystem itself.

---

## Phase 7: Configuring the Sentinel Repositories

With the hub operational, I deployed the reporting capability to three satellite repositories. Each received two files.

### The /done command — `.claude/commands/done.md`

This prompt runs when I type `/done` in any sentinel terminal session:

```
Analyze the current git diff and generate a draft post for the Analytics AI Garden.

Steps:
1. Run git diff HEAD --stat for a summary, then git diff HEAD for the full diff.
2. Extract two information layers:
   - Technical Achievement (the "how"): specific code, patterns, techniques used
   - Managerial Perspective (the "why"): business impact, data quality, strategic value
3. Assign category:
   GenAI — LLMs, prompt engineering, AI pipelines, Claude, Gemini, LangChain
   MLOps — CI/CD, Vertex AI, dbt pipelines, monitoring, deployment
   Data Architecture — BigQuery, dbt models, medallion layers, schema design
4. Choose one keyword (max 12 chars) that captures the core theme.
   This becomes the SVG petal text on the botanical card.
5. Write the draft to: C:\meu-digital-garden\src\content\drafts\YYYY-MM-DD-[slug].md

Frontmatter: title, date, category, keyword, id: "DRAFT",
author: "Gabriella Pinheiro", status: "Draft 🌿", excerpt.

Body sections:
## Technical Achievement
[2–3 paragraphs: what was built, specific names, how it works]

## Managerial Perspective
[1–2 paragraphs: why it matters, connected to business or strategic outcomes]

## Key Decisions
[bullet list: what was chosen and why, what trade-offs were made]

## What's Next
[one sentence]

After saving: confirm the path and remind to move to garden/ to publish.
```

### The CLAUDE.md domain brief — one per sentinel

Each sentinel's `CLAUDE.md` configures Claude Code's persona for that specific domain. The prompts I used to generate them:

**For `edu-expansion-intelligence` (dbt + BigQuery + Vertex AI):**
```
Create CLAUDE.md for this repository. Configure Claude Code as a Technical Documentarian.
Context:
- Project: MBA TCC at FGV — educational market intelligence pipeline
- Stack: dbt 1.11, BigQuery, Vertex AI K-Means, LangChain + Gemini
- Data sources: INEP, RAIS, Atlas ADH, IDEB, INSE, Censo Escolar
- Grain: municipality × year, IBGE 7-digit id_municipio as join key
- Architecture: medallion (staging → mart → ML features)
Category default: Data Architecture for modeling, MLOps for pipeline work.
Sentinel block: on /done, export to C:\meu-digital-garden\src\content\drafts\
Connect technical decisions to economic and educational policy implications.
```

**For `AI-exploratory` (Anthropic Economic Index research):**
```
Create CLAUDE.md for this repository.
Context: research on the Anthropic Economic Index and Brazilian AI adoption patterns.
Category default: GenAI.
On /done: frame findings through LLM adoption curves, economic impact, 
and organizational AI maturity. Audience: data manager with economics background.
```

**For `portfolio-ml` (people analytics + ML experiments):**
```
Create CLAUDE.md for this repository.
Context: production-grade people analytics and ML experiments.
Stack: Python, XGBoost, SMOTE, sklearn pipelines.
Category default: MLOps.
On /done: focus on model design decisions, data imbalance strategies, 
and what model outputs mean for HR and people strategy.
```

---

## Phase 8: Sidebar and UI Layer

The final session completed the interface. The sidebar needed to be rebuilt after an earlier iteration had dropped it. My prompt:

```
Restore the hamburger menu sidebar to index.astro.
Requirements:
- Slides in from the left — CSS transition: cubic-bezier(0.25, 0.8, 0.25, 1), 0.4s
- Glassmorphism overlay: backdrop-filter: blur(3px), rgba(252, 250, 246, 0.7)
- Close on: close button click, overlay click, Escape key
- Content sections:
  README.md header with "> whoami" tag
  Short professional bio
  // background: Manager of Data Intelligence at FGV, team of 13, MSc + MBA
  // find me: LinkedIn and GitHub links
- CSS-only blur effect — no animation library
- Hamburger: three-bar SVG, 28×20px, currentColor
```

```
Add a tagline below the site title in the header:
  const author: Manager<AI, Analytics> = "Gabriella Pinheiro"; // insights catalog
Style it as inline code — monospace font, muted color (#857f76), small size.
```

The sidebar uses only vanilla JavaScript for the toggle state — nine lines, no framework.

---

## The Design System: Glassmorphism Meets Botanical Data

The visual identity was designed around one constraint: it must read as a **professional knowledge base, not a blog**. The full token set:

| Token | Value | Rationale |
|---|---|---|
| Background | `#fcfaf6` | Warm off-white — evokes paper, reduces eye strain |
| Text main | `#2d2d2d` | Near-black — softer than pure black |
| Text muted | `#857f76` | Dates, categories, secondary labels |
| Stem green | `#7a8c71` | Botanical anchor — stems and accent lines |
| Dandelion | `#d97a8a` | GenAI — warm rose, energy and emergence |
| Lavender | `#827397` | MLOps — methodical purple, systematic thinking |
| Tulip | `#c48b52` | Data Architecture — amber, structural warmth |

Typography uses Gotham as the reference (commercial license), with Space Grotesk and Space Mono as the Google Fonts implementation — matching Gotham's geometric humanist character without a license file in the repository.

---

## What This Is Really About

My MSc in Economics at UFF introduced me to the concept of **total factor productivity** — the portion of output growth not explained by increases in capital or labor alone. TFP captures the residual: better processes, better knowledge, better institutional capacity.

A data professional's TFP lives in their documented decisions. The architecture choices made and why. The models rejected and the reasoning behind the rejection. The economic framing brought to a technical problem.

Without documentation, that TFP is private — or worse, ephemeral. It lives in Slack threads and terminal sessions and evaporates when the project ends or the team changes.

The AInalytics Garden is a **TFP externalization system**. Not a portfolio for recruiters. Not a blog for followers. A professional knowledge infrastructure designed to make the reasoning behind 8+ years of analytical practice publicly searchable and institutionally durable.

Built in one session. Extended in a second. Maintained by a `/done` command.

It is not finished. No garden ever is. But it is growing.
