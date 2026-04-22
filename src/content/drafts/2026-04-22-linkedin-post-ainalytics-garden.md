---
title: "LinkedIn Post — My AInalytics Garden"
date: 2026-04-22
author: "Gabriella Pinheiro"
status: "Draft 🌿"
excerpt: "Post de LinkedIn contando a construção do my AInalytics garden — por que, como, onde e com passo a passo."
---

<!-- RASCUNHO DE POST PARA LINKEDIN — NÃO É UM POST DO GARDEN -->
<!-- Revisar tom, cortar se ficar longo, adaptar abertura ao momento -->

---

Eu precisava de uma solução para um problema que conheço bem: **insights ficam no terminal. Documentação fica pra depois. "Pra depois" nunca chega.**

Como Gestora de Inteligência de Dados na FGV, coordeno um time de 13 pessoas enquanto termino um MBA em IA & Analytics. Três repositórios ativos gerando decisões arquiteturais todos os dias. Zero disso chegava a um conhecimento público, estruturado, pesquisável.

Aí eu parei de reclamar e construí um sistema.

---

**O que é o my AInalytics Garden?**

É um site estático publicado automaticamente — uma base de conhecimento que se alimenta do meu trabalho de engenharia sem eu precisar abrir um editor de texto separado.

Cada post é uma "planta botânica" animada em SVG. O texto das pétalas? A palavra-chave daquele projeto. Um post sobre arquitetura Medallion cresce uma tulipa com "Medallion" nas pétalas. Um post sobre XGBoost cresce uma lavanda. A visualização é o próprio conteúdo.

O site está no ar em: https://my-ainalytics-garden.vercel.app

---

**Por que construí assim?**

Documentação técnica tem um problema estrutural: ela compete com execução pelo mesmo recurso — atenção. A maioria das soluções resolve isso pedindo mais disciplina. Eu quis resolver eliminando a fricção.

O modelo que usei é o que chamo de **Reporter-Editor Framework**:

1. O **Reporter** (Claude Code, rodando nos meus repos) observa o que mudou via `git diff` e gera um rascunho estruturado automaticamente.
2. O **Staging** é uma pasta de rascunhos — o conteúdo é validado mas nunca publicado diretamente. Eu reviso.
3. O **Editor** é o Astro (framework estático) — mover um arquivo de `drafts/` para `garden/` é a ação de publicar. Nada mais.

---

**Como funciona na prática — passo a passo:**

**1. Configuro o "sentinela" em cada repositório**

Cada repo tem um arquivo `CLAUDE.md` na raiz que contextualiza o Claude Code: qual é o projeto, qual o stack, qual a categoria padrão (GenAI, MLOps ou Data Architecture). Isso dá ao modelo uma persona especializada — ele não é um chatbot genérico, é um Documentarista Técnico daquele domínio específico.

**2. Quando termino uma etapa de engenharia, digito `/done`**

O Claude Code executa automaticamente um `git diff`, extrai duas camadas de informação — o "como" técnico e o "por que" estratégico — e escreve um arquivo `.md` estruturado na pasta `drafts/` do meu site.

**3. Eu reviso o rascunho**

Verifico se nenhuma informação sensível vazou, ajusto o tom, confirmo que a palavra-chave captura bem o conceito central.

**4. Movo o arquivo para `garden/` e faço push**

O Vercel detecta o commit, builda e publica em ~30 segundos. Um novo card botânico aparece na grade.

Tempo total do `/done` até o post publicado: **menos de 5 minutos**.

---

**O que usei para construir:**

- **Astro 4.x** — framework de site estático com Content Collections e validação de schema via Zod
- **Claude Code** — CLI da Anthropic que roda no terminal com contexto completo do repositório
- **Vanilla CSS** — sem Tailwind, sem bibliotecas de componentes
- **SVG botânico gerado server-side** — sem JavaScript no cliente
- **Vercel** — deploy automático em cada push para `main`
- **GitHub** — repositório em gabifgv/my-ainalytics-garden

O site inteiro foi construído em uma tarde. A arquitetura de automação foi configurada na mesma sessão.

---

**Por que isso importa além do projeto pessoal?**

Existe um conceito em economia chamado **Produtividade Total dos Fatores** — a parte do crescimento que não é explicada por mais capital ou mais mão de obra. É o residual: melhores processos, melhor conhecimento, melhor capacidade institucional.

A TFP de um profissional de dados vive nas suas decisões documentadas. As escolhas arquiteturais e o raciocínio por trás delas. Os modelos descartados e o motivo. Sem documentação, isso é privado ou efêmero — evapora quando o projeto termina ou o time muda.

O AInalytics Garden é um sistema de **externalização de TFP**. Não é portfólio para recruiter. Não é blog para seguidores. É infraestrutura de conhecimento profissional — pesquisável, durável, indexável.

---

Se você gerencia times técnicos e sente que os insights somem no terminal, me conta nos comentários. Esse problema tem solução de engenharia.

#DataEngineering #MLOps #GenAI #ClaudeCode #Anthropic #Astro #Documentação #DataLeadership #FGV
