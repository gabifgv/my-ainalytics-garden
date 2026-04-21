Analyze the current git diff and generate a draft post for the Analytics AI Garden.

Steps:
1. Run `git diff HEAD --stat` to get a summary of changed files, then `git diff HEAD` for the full diff.
2. From the diff, extract:
   - **Technical Achievement** (the "how"): specific code changes, patterns, or techniques used
   - **Managerial Perspective** (the "why"): business impact, data quality improvement, scalability, or strategic value
3. Determine the category:
   - `GenAI` — LLM usage, prompt engineering, AI pipelines, Claude, Gemini, LangChain
   - `MLOps` — CI/CD for models, dbt, Vertex AI, deployment pipelines, monitoring
   - `Data Architecture` — BigQuery schemas, dbt models, data modeling, medallion layers, joins
4. Choose a single `keyword` (one word max 12 chars) that captures the core theme — this becomes the SVG petal text.
5. Generate the draft file with this exact structure and save it to `C:\meu-digital-garden\src\content\drafts\YYYY-MM-DD-[topic-slug].md`:

```markdown
---
title: "[Descriptive title — action-oriented]"
date: YYYY-MM-DD
category: "[GenAI|MLOps|Data Architecture]"
keyword: "[SingleWord]"
id: "DRAFT"
author: "Gabriella Pinheiro"
status: "Draft 🌿"
excerpt: "[One sentence: what was achieved and why it matters]"
---

## Technical Achievement

[2–3 paragraphs explaining WHAT was built. Be specific: mention function names, model names, table names, patterns. Avoid vague language. Write as if explaining to a senior data engineer joining the team.]

## Managerial Perspective

[1–2 paragraphs on WHY this matters. Connect the technical change to business outcomes: data reliability, pipeline efficiency, team scalability, or strategic positioning. Use the voice of a Data Manager writing for peers and stakeholders — not a junior developer.]

## Key Decisions

- [Decision 1: what was chosen and why]
- [Decision 2: what trade-off was made]

## What's Next

[1 sentence on the logical next step.]
```

After saving the file, confirm the path and remind Gabriella to review and move it to `garden/` when ready to publish.
