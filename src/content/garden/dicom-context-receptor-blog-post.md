---
title: "Building the FGV MARKETING Context Receptor: How I Gave FGV's AI a Memory"
date: 2026-04-26
category: "Data Architecture"
keyword: "ContextAI"
flower_type: "rose"
id: "0006"
author: "Gabriella Pinheiro"
excerpt: "A complete step-by-step build log of the operational context infrastructure I architected for FGV's DICOM — connecting a no-code form to GitHub, Power Automate, SharePoint, and an AI consumption layer, from zero to production in one day."
---

## The Problem That Prompted This Build

There is a specific failure mode in AI-assisted analytics that nobody talks about enough: the **context gap**.

You build the pipeline. You connect the databases. You deploy the agent. The AI has access to lead volume data, campaign performance metrics, enrollment funnels, and historical series going back years. It is technically capable of answering almost any question about marketing performance.

And then someone asks: *"Why did leads drop 60% in March?"*

The AI answers with a seasonality hypothesis, a cohort decomposition, and a beautifully formatted markdown table. Every number is correct. The conclusion is entirely wrong — because the campaign was paused for 18 days by a board decision, and the AI had no way of knowing that.

That gap — between what the data shows and what actually happened — is not a data engineering problem. It is a **knowledge infrastructure problem**. The institutional memory that explains anomalies lives in people's heads: in the media agency coordinator, in the events team manager, in the commercial director who made the pause decision. It never makes it into a database.

At FGV's DICOM (Diretoria de Comunicação e Marketing), I manage a Data Intelligence team of 13 professionals across three coordinations: Data Analytics, Research, and Performance Media. We run `(IM)arket`, an automated competitive intelligence platform, and support strategic decisions for two superintendencies — Escolas and IDE — covering the full portfolio from undergraduate programs to Executive MBA.

Our AI analysis capability was mature. Our context layer did not exist.

This is the full build log of how I created it.

---

## Architecture Overview: Three Destinations, One Action

Before writing a single line of code, I mapped the full system as an architectural decision:

```
[FORM]  →  [VERCEL hosting]  →  [TWO PARALLEL PIPELINES]

Pipeline 1: GitHub Action
  └── contexts/history/YYYY-MM-DDThh_mm_ss_[type]_[product].md
  └── contexts/context_latest.md
  └── contexts/INDEX.md

Pipeline 2: Power Automate
  └── SharePoint/Dados/CONTEXTOS/history/*.md
  └── SharePoint/Dados/CONTEXTOS/contexto.xlsx (dashboard row)
```

Every form submission routes to three outputs simultaneously: a rich Markdown file in GitHub (for AI consumption), a Markdown file in SharePoint (for human consultation), and a structured Excel row (for Power BI dashboard annotations).

Four design constraints were non-negotiable from the start:

1. **The form must require zero technical knowledge.** The target user is a media agency coordinator, an events manager, or a CRM analyst — not an engineer. If it requires explanation, it fails.
2. **No token can appear in public code.** The repository is public (GitHub Pages requirement). All credentials must route through secrets.
3. **Nothing is ever deleted.** The historical record accumulates indefinitely. Context from 2024 may explain 2026 YoY comparisons.
4. **The AI receives instructions, not just data.** Each Markdown file includes auto-generated analysis guidance specific to the event type — so the AI knows not just what happened, but how to adjust its interpretation.

---

## Phase 1: The GitHub Repository

### Step 1.1 — Create the repository

Go to `https://github.com/new` and create:
- **Repository name:** `receptor-contexto-fgv-dicom`
- **Visibility:** Public (required for free GitHub Pages hosting)
- **Initialize with:** README

After creation, clone locally:

```bash
git clone https://github.com/gabifgv/receptor-contexto-fgv-dicom.git
cd receptor-contexto-fgv-dicom
```

### Step 1.2 — Create the folder structure

```bash
mkdir -p contexts/history
mkdir -p outputs
mkdir -p skill/references
mkdir -p .github/workflows
touch contexts/history/.gitkeep
touch outputs/.gitkeep
```

The `.gitkeep` files are empty placeholders that force Git to track otherwise-empty directories.

### Step 1.3 — Create the `.gitignore`

```gitignore
# Generated outputs — not versioned
outputs/*.xlsx
outputs/*.csv

# Keep placeholders
!outputs/.gitkeep
!contexts/history/.gitkeep

# OS files
.DS_Store
Thumbs.db

# Never commit credentials
*.env
.env
config.local.js
```

### Step 1.4 — Add core documentation files

Create `CLAUDE.md` at the repository root. This file configures how any LLM agent should behave when reading this repository. The key sections are:

**Identity:** Define the analytical persona — in this case, a Marketing Intelligence Analyst for DICOM/FGV with full context of both superintendencies, their products, modalities, and business cycles.

**Rule #1 — Context before data:** Every analysis session must start by reading `contexts/context_latest.md` and listing files in `contexts/history/`. If no context file exists, the analysis opens with an explicit warning that findings may miss non-data explanations for anomalies.

**Rule #2 — Report structure:** Every report generated must begin with an "Active Operational Contexts" block that lists all registered events overlapping with the analysis period, before any numerical findings.

**Rule #3 — Dashboard output:** Every analysis must generate `outputs/ocorrencias_dashboard.xlsx` with one row per product per ISO week, including the `resumo_5_palavras` column for chart mouseover annotations.

**Organizational taxonomy:** The complete product-modality-praça-flight mapping for both superintendencies, so the AI understands the full scope without requiring explanation in each prompt.

Create `README.md` with project description, architecture diagram, access URL, and usage rules (documented in the full README in this repository).

### Step 1.5 — Commit and push initial structure

```bash
git add .
git commit -m "feat: initial repository structure"
git push origin main
```

---

## Phase 2: The GitHub Actions Workflow

The GitHub Action is the engine that converts form submissions into structured Markdown files. It runs on `workflow_dispatch` — meaning it is triggered programmatically by the form, not by a git push.

### Step 2.1 — Create the GitHub Actions Secret

The Action needs write access to the repository. Go to:

`https://github.com/gabifgv/receptor-contexto-fgv-dicom/settings/secrets/actions`

Click **New repository secret**:
- **Name:** `GH_CONTEXT_TOKEN`
- **Value:** A GitHub Personal Access Token (PAT) with `repo` scope

To generate the PAT:
1. Go to `https://github.com/settings/tokens`
2. **Generate new token (classic)**
3. Name: any descriptive label (e.g. `dicom-context-action`)
4. Expiration: No expiration
5. Scope: Check **`repo`** (full repository control)
6. Generate and copy the token

The token is stored as a repository secret — it is never visible in the codebase or logs.

### Step 2.2 — Write the workflow file

Create `.github/workflows/save-context.yml`:

```yaml
name: Salvar Contexto DICOM

on:
  workflow_dispatch:
    inputs:
      payload:
        description: 'JSON with context data'
        required: true
        type: string

jobs:
  save:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_CONTEXT_TOKEN }}

      - name: Process and save context
        env:
          PAYLOAD: ${{ inputs.payload }}
        run: |
          python3 << 'PYEOF'
          import json, os, re
          from datetime import datetime, timezone
          from pathlib import Path

          payload = json.loads(os.environ['PAYLOAD'])

          # Extract fields
          fonte = payload.get('fonte', '')
          cargo = payload.get('cargo', '')
          produtos = payload.get('produtos', [])
          assunto = payload.get('assunto', '')
          descricao = payload.get('descricao', '')
          impacto = payload.get('impacto', '')
          periodo_ini = payload.get('periodo_inicio', '')
          periodo_fim = payload.get('periodo_fim', '')
          semana = payload.get('semana', '')
          ano = payload.get('ano', '')
          veiculo = payload.get('veiculo', '')
          nome_evento = payload.get('nome_evento', '')
          desc_tecnica = payload.get('descricao_tecnica', '')
          desc_outro = payload.get('descricao_outro', '')
          material = payload.get('material_texto', '')
          praca = payload.get('praca', '')
          flight = payload.get('flight', {})
          resumo = payload.get('resumo_5_palavras', '')
          timestamp = payload.get('timestamp', datetime.now(timezone.utc).isoformat())

          # Human-readable labels
          tipo_label = {
            'campanha': 'Media Campaign',
            'evento': 'Event',
            'questao_tecnica': 'Technical Issue / System',
            'site': 'Site / Digital Platform',
            'processo_seletivo': 'Selection Process',
            'outro': 'Other'
          }.get(assunto, assunto)

          impacto_label = {
            'baixo': 'Low — minor noise, does not compromise analysis',
            'medio': 'Medium — affected 1 month or 1 channel, attention in comparatives',
            'alto': 'High — affected period results, explain variations',
            'critico': 'Critical — distorts entire analysis, isolate period'
          }.get(impacto, impacto)

          # Product lists
          supers = list(dict.fromkeys(p.get('superintendencia','') for p in produtos))
          prods = list(dict.fromkeys(p.get('produto','') for p in produtos))
          modals = list(dict.fromkeys(p.get('modalidade','') for p in produtos if p.get('modalidade')))

          super_str = ', '.join(supers)
          prod_str = ', '.join(prods)
          modal_str = ', '.join(modals) if modals else 'N/A'

          # Flight info
          if isinstance(flight, dict) and flight:
            flight_lines = '\n'.join(f'  - {p}: **{f}**' for p, f in flight.items())
          else:
            flight_lines = '  - Not applicable (IDE)'

          # Analysis instructions by type
          instrucoes = {
            'campanha': f"""- Volume variation in this period is directly related to this media event
- When comparing with adjacent periods, account for investment or active channel differences
- CPL and CPA for this period must carry an explanatory note on media context
- Affected channels: {veiculo or 'not specified'}""",
            'evento': f"""- Possible registration spike in this period does NOT represent organic campaign leads
- Event participants must be segmented separately in funnel analysis
- ISO week {semana} of {ano} may show a positive anomaly from this event
- Do not attribute the registration spike to paid media performance""",
            'questao_tecnica': f"""- Period data may be INCOMPLETE or DUPLICATED due to system failure
- Leads generated during the outage window may not have been captured
- Conversion rate for this period may be artificially distorted
- System / issue: {desc_tecnica}""",
            'site': """- Session and conversion drops do NOT reflect real demand decline
- Conversion rate for this period must be excluded from averages and benchmarks
- Digital performance comparisons with this period require explicit notation""",
            'processo_seletivo': """- Expected seasonality — compare preferentially with the same period from prior years
- Lead volume may be inflated by active candidate search behavior
- Analyze qualification rate with greater attention than usual""",
            'outro': f"""- Apply the description as qualitative context in data interpretation
- Subject: {desc_outro}"""
          }.get(assunto, '- See full description below')

          # Conditional sections
          praca_row = f'| **Praça(s)** | {praca} |\n' if praca else ''
          veiculo_sec = f'\n### Media Vehicles\n{veiculo}\n' if veiculo else ''
          evento_sec = f'\n### Event Name\n{nome_evento}\n' if nome_evento else ''
          material_sec = f'\n## Supporting Material\n\n> {material.replace(chr(10), chr(10)+"> ")}\n' if material else ''

          # Generate Markdown
          md = f"""# Operational Context: {tipo_label}
> Auto-generated by the DICOM Context Receptor · FGV

---

## Identification

| Field | Value |
|---|---|
| **Registered by** | {fonte} |
| **Role** | {cargo or 'not provided'} |
| **Registration date** | {timestamp[:10]} |
| **Timestamp** | {timestamp} |

---

## Event Scope

| Field | Value |
|---|---|
| **Superintendency** | {super_str} |
| **Product(s)** | {prod_str} |
| **Modality(ies)** | {modal_str} |
{praca_row}| **Event type** | {tipo_label} |
| **Period** | {periodo_ini} to {periodo_fim} |
| **ISO Week** | Week {semana} of {ano} |

### Flight (Escolas only)
{flight_lines}
{veiculo_sec}{evento_sec}
---

## What Happened

{descricao}

---

## Data Impact Level

**{impacto_label}**

---

## Analysis Instructions

> When analyzing **{prod_str}** data for the period **{periodo_ini} to {periodo_fim}**, apply:

{instrucoes}

---

## 5-Word Summary *(for chart mouseover)*

> **{resumo}**

---
{material_sec}
## Technical Metadata

```json
{{
  "produto": "{prod_str}",
  "superintendencia": "{super_str}",
  "semana": {semana},
  "ano": {ano},
  "assunto": "{assunto}",
  "impacto": "{impacto}",
  "periodo_inicio": "{periodo_ini}",
  "periodo_fim": "{periodo_fim}",
  "resumo_5_palavras": "{resumo}"
}}
```

---
*This file is part of the DICOM/FGV operational context system. Do not edit manually.*
"""

          # Generate filename
          slug = re.sub(r'[^a-z0-9-]', '', prod_str.lower().replace(' ','-').replace('ã','a').replace('ó','o').replace('é','e').replace('ê','e').replace('ç','c'))[:30]
          ts_str = timestamp[:19].replace(':','-').replace('T','-')
          nome_arquivo = f"{ts_str}_{assunto}_{slug}.md"

          # Save files
          Path('contexts/history').mkdir(parents=True, exist_ok=True)
          with open(f'contexts/history/{nome_arquivo}', 'w', encoding='utf-8') as f:
            f.write(md)
          with open('contexts/context_latest.md', 'w', encoding='utf-8') as f:
            f.write(md)

          # Update INDEX.md
          index_path = Path('contexts/INDEX.md')
          header = """# Operational Context Index — DICOM FGV

> Auto-updated. Read this file first to navigate available contexts.
> Each row links to a full context file in `history/`.

| Start date | Superintendency | Product | Type | Impact | Summary | File |
|---|---|---|---|---|---|---|
"""
          nova_linha = f'| {periodo_ini} | {super_str} | {prod_str} | {tipo_label} | {impacto} | {resumo} | [view](history/{nome_arquivo}) |'

          if index_path.exists():
            conteudo = index_path.read_text(encoding='utf-8')
            conteudo = conteudo.rstrip() + '\n' + nova_linha + '\n'
          else:
            conteudo = header + nova_linha + '\n'

          index_path.write_text(conteudo, encoding='utf-8')
          print(f"Saved: contexts/history/{nome_arquivo}")
          PYEOF

      - name: Commit and push
        run: |
          git config user.name "DICOM Context Bot"
          git config user.email "dicom-bot@fgv.br"
          git remote set-url origin https://x-access-token:${{ secrets.GH_CONTEXT_TOKEN }}@github.com/gabifgv/receptor-contexto-fgv-dicom.git
          git add contexts/
          git diff --staged --quiet || git commit -m "context: ${{ fromJson(inputs.payload).assunto }} - ${{ fromJson(inputs.payload).periodo_inicio }}"
          git push
```

**Key architectural decisions in this workflow:**

The `workflow_dispatch` trigger with a `payload` input is what makes this API-callable. Without `workflow_dispatch`, the Action can only be triggered by git events — which would require committing data before the Action processes it, creating a circular dependency.

The Python script runs inline via heredoc (`python3 << 'PYEOF'`) rather than as a separate file. This avoids a chicken-and-egg problem: if the Python script were a file in the repository, you'd need the Action to run before the script exists, but the script needs to be there for the Action to reference it.

The `git remote set-url` command re-injects the token into the remote URL for the push step. Without this, the `actions/checkout` token (which has read-write permissions) does not automatically apply to the `git push` command in the shell, causing authentication failures.

---

## Phase 3: The Form Frontend

The form is a single `index.html` file at the repository root, served via Vercel. It is vanilla HTML, CSS, and JavaScript — no build step, no framework, no dependencies.

### Step 3.1 — Key design decisions

**Single file.** The entire application lives in `index.html`. No `npm install`, no build pipeline, no framework to maintain. The target environment is a corporate browser in a government-adjacent institution — simplicity is resilience.

**Conditional rendering by product selection.** The flight field appears only when at least one Escolas product is checked, and it renders the correct options per product (GRADUAÇÃO gets `.1` and `.2`; IDT gets `.1` through `.4`; STRICTO gets just the year). The praça selector appears only inside the IDE block, triggered by any IDE checkbox. These behaviors are JavaScript-driven with no external libraries.

**Two simultaneous submissions.** The form's `enviar()` function fires two async calls in parallel via `Promise.all()`: one to the Power Automate webhook (for SharePoint and Excel), and one to the GitHub Actions API (for the Markdown files). The user sees a single "success" state — the routing is invisible.

**Automatic computations.** ISO week number and year are computed from the start date using a standard ISO 8601 algorithm in JavaScript. The `resumo_5_palavras` field is auto-generated by the form based on the event type, product, and vehicle — the user never types a 5-word summary manually.

### Step 3.2 — The GitHub Actions trigger call

The form calls the GitHub Actions API to dispatch the workflow:

```javascript
const GITHUB_TOKEN = 'ghp_...'; // repo-scope PAT
const GITHUB_REPO = 'gabifgv/receptor-contexto-fgv-dicom';

async function salvarNoGitHub(dados, semana, ano, resumo) {
  const payload = { ...dados, semana: String(semana), ano: String(ano), resumo_5_palavras: resumo };
  
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/save-context.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main', inputs: { payload: JSON.stringify(payload) } })
    }
  );
}
```

**Important note on token security:** Because the repository is private, the token appearing in `index.html` is not exposed to the public. If the repository ever becomes public, the token must be moved to a server-side proxy (a Vercel serverless function, for example) or rotated immediately. GitHub's secret scanning will automatically revoke any PAT it detects in public repositories.

### Step 3.3 — Flight logic implementation

The flight section is rendered dynamically each time product selection changes:

```javascript
const FLIGHT_OPTIONS = {
  'GRADUAÇÃO': ['2026.1','2026.2'],
  'IDT':       ['2026.1','2026.2','2026.3','2026.4'],
  'STRICTO':   ['2026'],
  'LATO':      ['2026.1','2026.2'],
  'LAW RJ':    ['2026.1','2026.2'],
  'LAW SP':    ['2026.1','2026.2'],
};

function renderFlightSection() {
  const escolasProdutos = [];
  document.querySelectorAll('[data-super="ESCOLAS"]:checked').forEach(chk => {
    const p = chk.dataset.produto;
    if (!escolasProdutos.includes(p)) escolasProdutos.push(p);
  });
  // Render one row per product with its correct flight options
}
```

Each product maintains its own selected flight value in a `flightSelecionado` object — a dictionary keyed by product name. This allows a user who selects both GRADUAÇÃO and IDT to set `.2` for GRADUAÇÃO and `.3` for IDT independently.

---

## Phase 4: Vercel Deployment

### Step 4.1 — Connect the repository to Vercel

1. Go to `https://vercel.com` and sign in with GitHub
2. Click **Add New → Project**
3. Import `gabifgv/receptor-contexto-fgv-dicom`
4. Leave all settings at default (Application Preset: Other, Root Directory: `.`)
5. Click **Deploy**

Vercel detects that the root directory contains `index.html` and serves it as a static site. No build step is required.

The deployment URL is automatically assigned: `https://receptor-contexto-fgv-dicom.vercel.app`

**Why Vercel and not GitHub Pages?** GitHub Pages only serves static content from public repositories on the free plan. Our repository is private (to protect the token). Vercel supports private repository deployments on its free Hobby plan, making it the correct choice here.

Every push to the `main` branch triggers an automatic Vercel redeploy. Form updates are live in approximately 30 seconds after `git push`.

---

## Phase 5: Power Automate Integration

Power Automate handles the SharePoint side of the pipeline: adding a row to the dashboard Excel file and creating a Markdown file in the SharePoint document library.

### Step 5.1 — Prepare the SharePoint structure

In `https://fgvbr.sharepoint.com/sites/GIM-DICOM`:

1. Navigate to the **Dados** document library
2. Create a new folder called `CONTEXTOS`
3. Inside `CONTEXTOS`, create two subfolders: `history` and `attachments`
4. Move (or create) `contexto.xlsx` inside `CONTEXTOS`

### Step 5.2 — Prepare the Excel file

Open `contexto.xlsx` in SharePoint Online (Excel for the web):

1. In cell A1, enter the following headers across columns A through N:

```
semana | ano | produto | superintendencia | modalidade | tipo_evento | canal | resumo_5_palavras | impacto | registrado_por | cargo | descricao_completa | flight | praca
```

2. Select the entire header row (A1:N1)
3. Go to **Insert → Table** → check "My table has headers" → **OK**
4. With the table selected, go to the **Table Design** tab → rename the table to `contextos` in the "Table Name" field
5. Save with **Ctrl+S**

The table name `contextos` is what Power Automate uses to reference the table programmatically.

### Step 5.3 — Create the Power Automate flow

Go to `https://make.powerautomate.com` and create a new **Automated cloud flow**:

- **Name:** `Receptor Contexto DICOM`
- **Trigger:** "When an HTTP request is received" (under the Solicitação / Request connector)

In the trigger configuration, paste this JSON schema in the "Request Body JSON Schema" field:

```json
{
  "type": "object",
  "properties": {
    "fonte": { "type": "string" },
    "cargo": { "type": "string" },
    "superintendencia": { "type": "string" },
    "produto": { "type": "string" },
    "modalidade": { "type": "string" },
    "periodo_inicio": { "type": "string" },
    "periodo_fim": { "type": "string" },
    "semana": { "type": "string" },
    "ano": { "type": "string" },
    "assunto": { "type": "string" },
    "veiculo": { "type": "string" },
    "nome_evento": { "type": "string" },
    "descricao": { "type": "string" },
    "resumo_5_palavras": { "type": "string" },
    "impacto": { "type": "string" },
    "flight": { "type": "string" },
    "praca": { "type": "string" },
    "timestamp": { "type": "string" }
  }
}
```

**Save the flow** — the HTTP trigger URL will be generated after saving. Copy this URL; it goes into the form's JavaScript as `POWER_AUTOMATE_URL`.

### Step 5.4 — Add the Excel action

Click **+ New Step** → search for **Excel Online (Business)** → select **"Add a row into a table"**.

- **Location:** Group - GIM-DICOM
- **Document Library:** Dados
- **File:** /CONTEXTOS/contexto.xlsx
- **Table:** contextos

In "Show advanced parameters", map each column to the corresponding dynamic content from the trigger:

| Column | Dynamic content |
|---|---|
| semana | `semana` |
| ano | `ano` |
| produto | `produto` |
| superintendencia | `superintendencia` |
| modalidade | `modalidade` |
| tipo_evento | `assunto` |
| canal | `veiculo` |
| resumo_5_palavras | `resumo_5_palavras` |
| impacto | `impacto` |
| registrado_por | `fonte` |
| cargo | `cargo` |
| descricao_completa | `descricao` |
| flight | `flight` |
| praca | `praca` |

Set **Formato de DateTime** to `ISO 8601`.

### Step 5.5 — Add the SharePoint Markdown action

Click **+ New Step** → search for **SharePoint** → select **"Create file"** (the SharePoint connector, not OneDrive for Business — they appear identically named but differ in the site URL field).

- **Site Address:** `GIM-DICOM - https://fgvbr.sharepoint.com/sites/GIM-DICOM`
- **Folder Path:** `/Dados/CONTEXTOS/history`
- **File Name:** Map using dynamic content: `timestamp` + `_` + `assunto` + `_` + `produto` + `.md`
- **File Content:** A Markdown string combining all dynamic content fields into the structured format

**Save the flow.**

### Step 5.6 — Configure trigger permissions

Open the trigger block ("When an HTTP request is received") and set **"Who can trigger the flow?"** to **"Anyone"** (not "Anyone in my tenant"). This generates a signed URL with a `sig` parameter that authenticates external calls from the form without requiring Microsoft login.

Copy the updated trigger URL (it now includes `&sp=...&sv=...&sig=...`) and update the form's `POWER_AUTOMATE_URL` constant.

---

## Phase 6: Repository Security

The repository was initially public to enable GitHub Pages. After switching to Vercel, the repository was made private.

Go to: `https://github.com/gabifgv/receptor-contexto-fgv-dicom/settings`
Scroll to **Danger Zone** → **Change repository visibility** → **Make private**.

This protects:
- The GitHub PAT stored in `index.html`
- The Power Automate webhook URL stored in `index.html`
- The CLAUDE.md configuration (organizational taxonomy, product hierarchy, analysis rules)

The Vercel deployment continues to work on private repositories under the free Hobby plan.

---

## Phase 7: The Skill and CLAUDE.md Layer

The `skill/` directory contains the Claude Code configuration that enables AI analysts to consume the context repository correctly.

### Step 7.1 — The SKILL.md

`skill/SKILL.md` defines the behavior pattern for the `dicom-context-receptor` skill. When loaded in a Claude Code session, it instructs the AI to:

1. Always read `contexts/context_latest.md` and list `contexts/history/` before any analysis
2. Map each registered context to its product scope, date range, and event type
3. Apply the adjustment table (see below) based on event type
4. Open every report with an "Active Operational Contexts" block
5. Generate the dashboard Excel with the correct column structure, expanding multi-week events into multiple rows

The adjustment table is the core of the skill's analytical value:

| Event type | Analytical adjustment |
|---|---|
| `campanha` | Volume drop expected; do not compare with non-paused periods without notation |
| `evento` | Possible organic spike; isolate event week in time series |
| `questao_tecnica` | Data may be incomplete; flag in analysis |
| `site` | Session/conversion drops do not reflect real demand; exclude or flag |
| `processo_seletivo` | Expected seasonality; compare with same period from prior years |
| `outro` | Apply free text as qualitative note; do not infer quantitative impact |

### Step 7.2 — The reference files

`skill/references/estrutura_fgv.md` contains the complete FGV product taxonomy — all superintendencies, products, modalities, flight options, media channels, and a glossary of operational terms (CPL, CPA, conversion rate, selection process, DICOM, IDE). This file eliminates the need to explain organizational structure in each analysis prompt.

`skill/references/exemplos_contexto.md` contains three calibrated examples of well-completed context registrations, with the corresponding JSON payload, 5-word summary, and explanation of what makes them analytically useful. It serves as the quality reference for the AI when interpreting ambiguously completed contexts.

---

## Phase 8: End-to-End Test

After completing all phases, the system was tested end-to-end:

1. Open `https://receptor-contexto-fgv-dicom.vercel.app`
2. Fill in a test context: name, Escolas → GRADUAÇÃO, flight 2026.2, event type, date range, description
3. Click **Registrar contexto**
4. Observe the success banner

**Verification checklist:**

```
GitHub Actions:
  → https://github.com/gabifgv/receptor-contexto-fgv-dicom/actions
  → Workflow "Salvar Contexto DICOM" shows as completed (green)
  → contexts/history/ now contains a new .md file
  → contexts/context_latest.md has been updated
  → contexts/INDEX.md has a new row

SharePoint:
  → GIM-DICOM → Dados → CONTEXTOS → history → new .md file present
  → GIM-DICOM → Dados → CONTEXTOS → contexto.xlsx → new row in "contextos" table

Power BI (if connected):
  → contexto.xlsx data source refresh shows new row
  → resumo_5_palavras column populated for mouseover annotation
```

---

## Phase 9: The Presentation Layer

To communicate this system to FGV's AI Committee and secure institutional support, I built a presentation as a single `HTML` file — no PowerPoint, no Keynote, no external dependencies.

The presentation (`cerebro-dicom-apresentacao.html`) is a full-page scroll experience with:
- 8 slides covering problem statement, the "molho" (sauce) metaphor, solution architecture, form mockup, impact metrics, tech stack, and CTA
- Custom CSS cursor in gold
- Scroll-driven progress bar
- IntersectionObserver-powered reveal animations
- Navigation pills with active section tracking
- Fully offline — no external API calls at runtime

The key narrative framing: AI analysis at DICOM was technically mature but contextually blind. The DICOM Context Receptor is the *molho* — the ingredient that transforms technically correct analysis into genuinely intelligent output. The brain icon (🧠) represents the collective institutional memory now flowing from every team (Events, CRM, Marketing, Media, Research, Agency) into a single structured repository.

The architectural diagram in slide 4 reflects the actual system:

```
Formulário → Vercel → Power Automate + GitHub Action → SharePoint + GitHub → IA com contexto
                                                     (INDEX.md · context_latest.md · history/*.md)
```

---

## What This System Is, Architecturally

Looking at the complete system, it implements a pattern I would call a **Knowledge Layer** — a persistent, structured, human-curated annotation store that sits between operational databases and AI analysis engines.

The distinction matters: this is not a data pipeline. No transformation is happening on the metrics data. The metrics live in their own systems (Salesforce, marketing platforms, enrollment databases). What this system provides is the **contextual frame** that makes metric interpretation possible.

In economics, this is the difference between descriptive statistics and structural analysis. You can describe every number in a time series. Structural analysis asks what generated those numbers — what institutional decisions, external events, and operational failures explain the pattern. The DICOM Context Receptor is the infrastructure for structural analysis.

For teams building similar systems: the architectural pattern scales beyond marketing analytics. Any domain where human-operated processes generate anomalies in data — sales operations, customer service, supply chain, clinical trials — benefits from a context layer that routes institutional knowledge into AI consumption infrastructure.

The build took one working session. The maintenance cost is near zero — it is entirely event-driven. The context accumulates indefinitely.

Every future analysis starts smarter than the last one.

---

## Key Decisions Log

- **Markdown over JSON for AI context files** — Markdown is human-readable, directly renderable in GitHub, and parsed as natural language by LLMs. JSON is better for programmatic extraction; the technical metadata block at the end of each .md file provides that.

- **GitHub Actions over server-side API proxy** — The Actions approach keeps the architecture entirely within GitHub's ecosystem, avoids managing serverless functions, and provides built-in execution logs and failure notifications.

- **Vercel over GitHub Pages** — GitHub Pages requires a public repository. Vercel supports private repositories on the free tier.

- **Power Automate over direct SharePoint API** — Power Automate is already part of FGV's Microsoft 365 license, requires no additional infrastructure, and provides a visual editor that non-engineers can audit and modify.

- **One context per event** — Compound contexts (multiple events in one submission) create ambiguity in the analysis instruction layer. The system enforces atomic registrations; multiple events in the same period require multiple submissions.

- **Repository made private** — The PAT in `index.html` represents a security risk in a public repository. GitHub's secret scanning automatically revokes exposed PATs, which broke the pipeline repeatedly during initial development. Private repository eliminates this failure mode entirely.

---

## What's Next

The immediate roadmap has two items:

**Attachment routing via SharePoint link** — Instead of base64 encoding binary files (which hits GitHub Actions input limits at ~65KB), the form will add a free-text field for a SharePoint document link. The AI receives the link and accesses the document directly. This avoids size constraints entirely and keeps binary files in SharePoint where access control is institutional.

**Automated job-matching agent** — A separate Claude Code project using Selenium to scrape LinkedIn for senior analytics roles, match against a base CV using ATS scoring logic, rewrite the CV for each posting, and send a daily summary email. Planned for May 2026 after the TCC P4 Vertex AI stage is stable.

The garden continues to grow.
