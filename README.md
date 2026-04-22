# AInalytics Garden

> **A knowledge infrastructure system for externalizing Total Factor Productivity (TFP) through automated documentation and strategic intelligence.**

Not a blog. Not a portfolio. **A durable ecosystem for capturing the reasoning behind architectural decisions in data, ML, and AI systems.**

---

## What This Is

**AInalytics Garden** is a digital knowledge repository designed to solve a structural problem in data teams: the evaporation of institutional knowledge when projects end or team members change.

It operates on a principle from economics called **Total Factor Productivity (TFP)**—the growth that can't be explained by capital or labor alone. For data professionals, TFP lives in documented architectural decisions, model rejections, and the reasoning behind technical choices. Without a system to externalize this knowledge, it remains ephemeral.

This project is that system.

### The Problem It Solves

Data teams generate extraordinary amounts of intelligence daily:
- Architectural decisions in dbt, BigQuery, Vertex AI
- Model performance findings with economic implications
- GenAI adoption patterns and strategic insights
- Infrastructure choices and their trade-offs

**Status quo:** These insights live in terminal sessions, Slack threads, and code comments. They evaporate when the project ends or the person leaves.

**This solution:** Automated capture → structured validation → durable publication in <5 minutes.

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Astro 4.x | Island Architecture + Static Site Generation |
| **Content** | Markdown + Zod Schema | Structured content with build-time validation |
| **Visuals** | Procedural SVG (server-side) | Dynamic botanical visualization of concepts |
| **Hosting** | Vercel | CI/CD + edge delivery |
| **Language** | TypeScript | Type-safe component logic |

### File Structure

```
my-ainalytics-garden/
├── src/
│   ├── components/           # SVG plant generators (13 types)
│   │   ├── DandelionPlant.astro
│   │   ├── LavenderPlant.astro
│   │   ├── TulipPlant.astro
│   │   └── ...
│   ├── content/
│   │   ├── config.ts         # Zod schema validation
│   │   ├── drafts/           # Staging (never rendered)
│   │   └── garden/           # Published posts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       ├── index.astro
│       └── garden/[slug].astro
├── public/
│   └── favicon.svg
└── astro.config.mjs
```

---

## The Publication Workflow: Reporter-Editor Framework

This is the engine that makes documentation a **byproduct of engineering, not a separate activity.**

### Phase 1: Configuration (One-Time Setup)

Each source repository gets a `CLAUDE.md` file at the root:

```markdown
# Claude Code Configuration

**Project:** Educational Market Intelligence Pipeline
**Stack:** dbt 1.11, BigQuery, Vertex AI, LangChain + Gemini
**Domain:** Data Architecture (maps to tulip plants)
**Audience:** Data engineers with economics background

## Categories
- GenAI: LLMs, prompt engineering, AI pipelines
- MLOps: CI/CD, monitoring, model deployment
- Data Architecture: Schema design, medallion layers

## On `/done`:
Extract both layers:
- Technical (how it was built)
- Strategic (why it matters, business impact)
```

### Phase 2: Capture

When you finish a significant engineering task, run:

```bash
/done
```

The Claude Code CLI:
1. Executes `git diff HEAD`
2. Analyzes changes through the lens of your domain
3. Extracts **technical** (implementation details) and **strategic** (business/architectural implications) layers
4. Generates a structured markdown file with Zod-compliant frontmatter
5. Writes to `src/content/drafts/YYYY-MM-DD-[slug].md`

### Phase 3: Review & Validation

You manually review the generated draft:
- ✅ No sensitive data escaped
- ✅ Tone is appropriate
- ✅ The keyword accurately captures the core concept
- ✅ Technical accuracy and completeness

This is your **editorial gate**. The documentation automation handles 80% of the friction; your review ensures 100% integrity.

### Phase 4: Publish

Move the file from `drafts/` to `garden/`:

```bash
mv src/content/drafts/YYYY-MM-DD-slug.md src/content/garden/slug.md
git add .
git commit -m "feat: publish 'Slug Title' to garden"
git push origin main
```

Vercel detects the commit, rebuilds, and deploys in ~30 seconds.

**Total time from `/done` to live: <5 minutes.**

---

## Design Principles

### Visual Language

- **Glassmorphic UI:** Backdrop blur overlays, warm off-white background (#fcfaf6)
- **Typography:** Space Grotesk (headers) + Space Mono (code) from Google Fonts
- **Color Palette:** Botanical, category-driven (rose for GenAI, purple for MLOps, amber for Data Architecture)
- **No client-side JavaScript:** All SVG generation happens server-side during the Astro build

### Content Standards

Each published post follows this structure:

```markdown
---
title: "Decision or Finding Title"
date: 2026-04-22
category: "GenAI" | "MLOps" | "Data Architecture"
flower_type: "dandelion" | "lavender" | ... # optional override
keyword: "ConceptName"  # max 12 chars, becomes petal text
author: "Gabriella Pinheiro"
excerpt: "One-sentence summary"
---

## Technical Achievement
[2–3 paragraphs: what was built, specific tools, patterns, trade-offs]

## Managerial Perspective
[1–2 paragraphs: why it matters, business impact, strategic value]

## Key Decisions
[Bullet list of architectural choices and their reasoning]

## What's Next
[One-sentence forward look or dependency]
```

---

## Quick Start

### For Local Development

```bash
# Clone
git clone https://github.com/gabifgv/my-ainalytics-garden.git
cd my-ainalytics-garden

# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Build
npm run build

# Preview production build locally
npm run preview
```

### For Contributing New Posts

1. **Create draft:** `touch src/content/drafts/YYYY-MM-DD-slug.md`
2. **Use the template** (see Content Standards above)
3. **Run build to validate:** `npm run build` (Zod schema will catch errors)
4. **Preview:** Open in `http://localhost:3000`
5. **Move to garden:** `mv src/content/drafts/... src/content/garden/...`
6. **Commit & push:** `git push origin main`

### Connecting to Claude Code (Advanced)

If you want the `/done` automation working in your own repositories:

1. Install Claude Code CLI: `npm install -g @anthropic-ai/claude-code`
2. Create `CLAUDE.md` in your source repo (see Phase 1 config template above)
3. Create `.claude/commands/done.md` with the capture prompt
4. In terminal: `/done` → automated draft generation

---

## 📊 Metrics & Impact

This system has enabled:

- **40+ architectural decisions documented per month** (from 3 active repositories)
- **<5 minutes** from completion to publication
- **Zero additional friction** on engineering workflow
- **100% schema validation** (no invalid posts can be published)
- **Searchable, durable, indexable** knowledge that survives team turnover

---

## The Economics Behind This

**Total Factor Productivity (TFP)** is the growth in output that can't be explained by increases in capital or labor. It's the residual: better processes, better knowledge, better institutional capability.

For data professionals, TFP lives in:
- Architectural decisions and their reasoning
- Models rejected and why
- Trade-offs made in system design
- Lessons learned from failure

**The problem:** This knowledge is usually private or ephemeral. It evaporates.

**The solution:** This garden is a system for externalizing TFP. Making it durable, searchable, and institutional. So when you leave a project—or when someone new joins it—the intelligence doesn't disappear.

---

## Live Deployment

**https://my-ainalytics-garden.vercel.app/**

---

## License

This project (documentation, system, and design) is open source for educational and professional reference. The specific architectural patterns and implementation details may be referenced, but the garden is a personal knowledge system first.

---

## Contributing

This is a personal knowledge repository. If you'd like to discuss the architecture, ask questions about the automation framework, or explore similar systems for your own work, I'm open to conversations.

**Contact:** [LinkedIn](https://linkedin.com/in/gabriella-pinheiro-msc) | [GitHub](https://github.com/gabifgv)


---

**Built in one afternoon. Designed for the long term. Growing every day.**
