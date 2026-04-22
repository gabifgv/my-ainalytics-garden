---
title: "Engineering a Second Brain: How I Automated My Technical Documentation with Claude Code"
date: 2026-04-21
category: "GenAI"
keyword: "AutoDOC"
flower_type: "rose"
id: "01/01"
author: "Gabriella Pinheiro"
status: "Live 🌱"
excerpt: "How I built an automated documentation ecosystem that turns terminal sessions into published knowledge — the genesis of the Analytics AI Garden, step by step."
---

## The Manager's Dilemma: Execution vs. Documentation

As a Manager of Data Intelligence leading a team of 13 professionals, my daily life oscillates between strategic governance and deep technical execution. Between my responsibilities at FGV and an MBA in AI & Analytics, I faced a recurring pattern: valuable engineering work was happening in my local terminal — dbt refactors, Vertex AI pipeline stages, Python analyses — and none of it was reaching a public knowledge base.

Traditional documentation felt like a second job that competed with the first. I needed a system where documentation was a **byproduct of engineering**, not a separate activity competing for the same attention budget.

This post is the genesis story. It describes the concept, the architectural decision, and the step-by-step configuration I built using **Claude Code** — Anthropic's CLI tool that runs directly in the terminal and operates with full filesystem and git context.

---

## The Insight: Collaborative Intelligence, Not Just Automation

In my research on the Anthropic Economic Index (documented separately in this garden), I noticed a pattern in how Brazilian organizations adopt AI: most settle for basic task delegation — giving repetitive work to the model. True technical leadership in the LLM era requires something different: **Collaborative Intelligence** — using AI to think, iterate, and document in real-time alongside engineering work.

The question I asked myself was not "can AI write my blog?" The question was: **can I make documentation a structural output of the same process that produces code?**

The answer is the **Reporter-Editor Framework**.

---

## The Reporter-Editor Framework: Architecture First

Before writing a single line of code, I mapped the system as an architecture decision:

```
[Reporter]   — Claude Code in sentinel repos, triggered by /done
                ↓ writes structured .md to shared staging folder
[Staging]    — src/content/drafts/ (validated but never rendered)
                ↓ manual editorial review
[Editor]     — src/content/garden/ → Astro build → Vercel deploy → live post
```

Three design constraints were non-negotiable from the start:

1. **The Reporter cannot publish directly.** All auto-generated content passes through a human review gate. As a Data Lead at a research institution, auto-publishing organizational work without review is not an option.

2. **The keyword is non-negotiable.** Every draft must include a single word — max 12 characters — that captures the core theme. This word becomes the visual content of the botanical SVG card. The constraint forces the AI and me to identify the essential concept, not just describe what changed.

3. **Moving a file is the publishing action.** There is no CMS, no button, no interface. Promoting a post from `drafts/` to `garden/` is the deliberate editorial decision. The governance gate is the filesystem itself.

---

## How I Set Up the Sentinels: Step by Step with Claude Code

I have three active repositories, each with a distinct technical domain:

- `C:\edu-expansion-intelligence` — dbt + BigQuery + Vertex AI (MBA TCC)
- `C:\AI-exploratory` — Anthropic Economic Index research
- `C:\portfolio-ml` — People analytics, XGBoost experiments

Each became a sentinel by receiving exactly two files. Here is the step-by-step, including the prompts I gave Claude Code for each.

---

### Step 1 — Open Claude Code in the sentinel repository

Claude Code is launched from the repository root in a terminal:

```bash
cd C:\edu-expansion-intelligence
claude
```

From this point, Claude Code has full context of that repository — its git history, its files, its structure. I then gave it the first prompt.

---

### Step 2 — Create the CLAUDE.md domain brief

The `CLAUDE.md` at the root of each repository is the identity file — it tells Claude Code who it is in this context, what the project is about, and how it should behave when `/done` is invoked.

**Prompt for `edu-expansion-intelligence`:**
```
Create a CLAUDE.md for this repository.
Configure Claude Code as a Technical Documentarian for this project.

Context to embed:
- Project: MBA TCC at FGV — educational market intelligence pipeline
- Stack: dbt 1.11, BigQuery, Vertex AI K-Means clustering, LangChain + Gemini
- Data sources: INEP, RAIS, Atlas ADH, IDEB, INSE, Censo Escolar
- Grain: municipality × year; universal join key is IBGE 7-digit id_municipio
- Architecture: medallion — staging models → mart_municipio_perfil → ML features
- Category default: Data Architecture for modeling work, MLOps for pipeline work

Sentinel integration block to append at the end of CLAUDE.md:
When /done is invoked, export the draft to:
C:\meu-digital-garden\src\content\drafts\YYYY-MM-DD-[slug].md
Follow the Reporter-Editor Framework defined in .claude/commands/done.md.
Connect technical decisions to their economic and educational policy implications.
The intended reader is a senior data practitioner with an economics background.
```

**Prompt for `AI-exploratory`:**
```
Create CLAUDE.md for this repository.
Context: personal research on the Anthropic Economic Index and 
Brazilian AI adoption patterns. Stack: Python, Pandas, notebooks.
Category default: GenAI.
Sentinel block: on /done, export draft to C:\meu-digital-garden\src\content\drafts\
Frame findings through LLM adoption curves, economic impact metrics, 
and organizational AI maturity levels.
```

**Prompt for `portfolio-ml`:**
```
Create CLAUDE.md for this repository.
Context: production-grade people analytics and ML experiments.
Stack: Python, XGBoost, SMOTE, sklearn pipelines, SHAP.
Category default: MLOps.
Sentinel block: on /done, export draft to C:\meu-digital-garden\src\content\drafts\
Focus on model design decisions, class imbalance strategies,
and what model outputs mean for HR strategy and people management.
```

---

### Step 3 — Deploy the /done command

The `/done` command lives at `.claude/commands/done.md` inside each repository. Claude Code picks up custom commands from this path automatically — typing `/done` in a session runs the prompt defined in that file.

I created this template once and deployed it across all three sentinels:

```
Analyze the current git diff and generate a draft post for the Analytics AI Garden.

Steps:
1. Run git diff HEAD --stat for a summary of changed files.
   Then run git diff HEAD for the full patch.
2. From the diff, extract two layers:
   - Technical Achievement (the "how"): specific code, functions, patterns, techniques
   - Managerial Perspective (the "why"): business impact, data quality, 
     scalability, strategic positioning
3. Assign category — exactly one of:
   GenAI — LLMs, prompt engineering, Claude, Gemini, LangChain, AI pipelines
   MLOps — CI/CD, Vertex AI, dbt pipelines, monitoring, deployment automation
   Data Architecture — BigQuery schema, dbt models, medallion layers, data contracts
4. Choose one keyword (max 12 characters) that captures the core theme.
   This word becomes the SVG petal text on the botanical card. Choose carefully —
   it should be the essential concept, not a description of the task.
5. Write the draft file to:
   C:\meu-digital-garden\src\content\drafts\YYYY-MM-DD-[slug].md

Frontmatter:
  title: "[action-oriented descriptive title]"
  date: YYYY-MM-DD
  category: "[GenAI|MLOps|Data Architecture]"
  keyword: "[SingleWord]"
  id: "DRAFT"
  author: "Gabriella Pinheiro"
  status: "Draft 🌿"
  excerpt: "[one sentence: what was achieved and why it matters]"

Body sections:
## Technical Achievement
[2–3 paragraphs: what exactly was built. Be specific — function names, 
table names, model names, patterns. Write for a senior data engineer.]

## Managerial Perspective
[1–2 paragraphs: why it matters. Connect to business outcomes — 
data reliability, pipeline efficiency, team scalability, strategic positioning.
Use the voice of a Data Manager writing for stakeholders.]

## Key Decisions
- [what was chosen and why]
- [what trade-off was made]

## What's Next
[one sentence: the logical next step from here]

After saving the file: confirm the full path and remind Gabriella 
to review the draft and move it to garden/ when ready to publish.
```

---

### Step 4 — Test the full pipeline end to end

After configuring the first sentinel (`edu-expansion-intelligence`), I ran a full test before deploying to the other two:

1. Made a real dbt staging change in that repo
2. Typed `/done` in the Claude Code session
3. Claude ran `git diff`, extracted the context, wrote the draft
4. Draft appeared at `C:\meu-digital-garden\src\content\drafts\`
5. I reviewed the draft in the garden project, adjusted tone, moved to `garden/`
6. `git add`, `git commit`, `git push origin main`
7. Vercel auto-deployed — live post in ~30 seconds

Total human time from typing `/done` to live published post: **under 5 minutes**, including reading and editing the draft.

The same sequence was then confirmed on `AI-exploratory` and `portfolio-ml`. The pipeline was operational.

---

## The Keyword Decision: Why One Word Matters

The `keyword` field deserves specific attention. In the Analytics AI Garden, each post's botanical card is an SVG illustration where the keyword **is** the illustration. A post about `Medallion` architecture grows a tulip with `Medallion` in the petals. A post about `XGBoost` grows a lavender plant spelling out `XGBoost`.

This is why the `/done` prompt specifies: *"choose carefully — it should be the essential concept, not a description of the task."*

When I ask Claude Code to choose a keyword during `/done`, I'm asking it to distill an entire engineering session into one word. That constraint is intentional. It forces both the AI and me to identify the **core concept** — the thing that, if you understood only one thing about this session, should be it.

The three category-to-plant mappings encode semantic intent:

- `GenAI` → **Dandelion** (radial dispersion — ideas spreading in all directions simultaneously)
- `MLOps` → **Lavender** (systematic, sequential, controlled — the discipline of production)
- `Data Architecture` → **Tulip** (defined structure, deliberate geometry, layers)

Beyond the defaults, the `flower_type` frontmatter field allows any post to override the category plant. A Data Architecture post that warrants a Lotus gets one. The category label still shows for filtering; only the visual identity changes.

---

## What the Sentinel Configuration Does to Your Workflow

Before: engineering insights accumulated in terminal history and git commits. Documentation required a separate context switch — open a doc, reconstruct what happened, explain why it mattered, find the right words.

After: reach a milestone in any sentinel repo, type `/done`. Review a structured draft in under 3 minutes. Move to `garden/`. Push. Done.

The documentation context switch is replaced by a review step. Reviews are fast. Context switches are expensive. The distinction matters at scale.

For a team of 13, this is also a model. When the documentation infrastructure exists and the friction is sub-5-minutes, the excuse for not documenting disappears. The system creates accountability by making the right behavior easy.

---

## Strategic Impact: Documentation as TFP

This project is rooted in my background as an MSc in Economics. In growth economics, **total factor productivity** is the residual that explains output growth beyond increases in capital and labor — it captures better processes, better knowledge, better institutional capacity.

A data professional's TFP lives in their documented decisions: the architectural choices made and why, the models rejected and the reasoning behind the rejection, the economic framing applied to a technical problem. Without documentation, that TFP is private at best, ephemeral at worst. It evaporates when a project ends or a team changes.

By automating the documentation pipeline, I am externalizing my TFP. Every engineering session produces two durable outputs: working code and published reasoning.

For my stakeholders and my team, this garden proves that I don't just manage data — I cultivate it.

---

## What's Next

The three sentinels are running. Posts are accumulating. What comes next is refinement: improving the Reporter's ability to surface non-obvious architectural decisions, extending the botanical library to express new knowledge categories, and eventually identifying cross-post patterns that reveal how engineering thinking evolves over time.

Documentation is no longer a task. It is a byproduct of my curiosity.

Welcome to the Analytics AI Garden.
