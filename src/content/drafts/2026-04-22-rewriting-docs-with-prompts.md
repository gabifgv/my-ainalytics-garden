---
title: "Rewriting the Garden's Foundation: Adding Claude Code Prompts to Published Posts"
date: 2026-04-22
category: "GenAI"
keyword: "Prompts"
id: "DRAFT"
author: "Gabriella Pinheiro"
status: "Draft 🌿"
excerpt: "How I rewrote the two foundational garden posts to include the exact Claude Code prompts used to build the system — transforming reflective architecture notes into reproducible step-by-step guides."
---

## Technical Achievement

This session was a documentation audit followed by a targeted rewrite of the two oldest published garden posts: `engineering-second-brain.md` (the conceptual origin post) and `making-of-garden.md` (the architectural deep-dive). Both were well-written reflections but lacked the one thing that makes technical documentation durable: **the exact input that produced the output**.

The rewrite of `making-of-garden.md` restructured the post into 8 explicit build phases, each anchored by the verbatim Claude Code prompt that triggered that phase of construction. Phase 1 covers Astro initialization, Phase 2 the Zod content schema, Phases 3–4 the botanical SVG engine and the `flower_type` override system, Phase 5 the expansion to 13 plant types, Phase 6 the governance gate, Phase 7 sentinel configuration across three repositories, and Phase 8 the sidebar and UI layer. Each phase shows what I asked, not just what got built.

The rewrite of `engineering-second-brain.md` transformed it from a framework manifesto into a sentinel configuration guide — four concrete steps, including the exact `CLAUDE.md` prompt per repository and the full `/done` command template. A fourth file was added to `src/content/drafts/`: a Portuguese LinkedIn post draft positioning the garden for a business audience, using the Reporter-Editor Framework framing without losing accessibility. A lowercase bug (`flower_type: "Tulip"` vs the schema's expected `"tulip"`) was caught and fixed in `architecting-brazils-educational-intelligence.md`, which had been silently breaking the Astro build since the previous session.

## Managerial Perspective

The original posts described what the system does. They did not describe how to reproduce it. For a documentation system whose entire value proposition is making engineering reasoning public and searchable, that gap was architectural: the garden was publishing conclusions without publishing the method.

Adding the prompts closes that loop. A data practitioner who reads `making-of-garden.md` now has everything needed to build an equivalent system from scratch — the Astro scaffold prompt, the Zod schema prompt, the SVG component specifications, the sentinel CLAUDE.md templates, the `/done` command in full. The posts are no longer retrospectives; they are runbooks. This also makes the garden's own construction a case study in what it advocates: systematic, traceable, reproducible knowledge externalization.

## Key Decisions

- **Prompts in English, organized by phase:** Claude Code prompts are written in English regardless of the user's working language. Organizing them by phase (rather than chronologically) makes the posts scannable and implementation-ready, not just readable.
- **Bugs documented honestly:** The `fix: forcing dynamic botanical selection` commit — and the Astro constraint that necessitated it — is documented in `making-of-garden.md` rather than smoothed over. Real engineering notes include the failures that shaped the decisions.
- **LinkedIn draft in drafts/, not garden/:** The LinkedIn post was placed in `src/content/drafts/` rather than published directly. It is editorial content, not a technical post, and doesn't yet have the required `category` and `keyword` fields for the garden schema. It needs review before any channel decision.

## What's Next

Review and promote the LinkedIn draft when ready, then consider back-filling prompts into the remaining three garden posts (`the-retention-algorithm`, `reading-brazils-ai-pulse`, `architecting-brazils-educational-intelligence`) using the same phase-structured approach.
