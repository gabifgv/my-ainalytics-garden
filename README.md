# my AInalytics garden

> "Much like a garden, my learning is constantly growing, carefully cultivated, and openly shared."

**my AInalytics garden** is a digital ecosystem designed to catalog and synthesize insights at the intersection of Economics, Generative Artificial Intelligence, and Data Architecture. Unlike traditional blogs, this project functions as a "Digital Garden"—a living repository where knowledge is publicly cultivated.

---

## Technical Architecture

The project is built on a modern web stack optimized for performance, refined typography, and dynamic SVG visualization.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | Astro | Island Architecture & Static Site Generation |
| **Content Engine** | Markdown | Structured Content Collections |
| **Visuals** | Procedural SVG | Dynamic plant generation via Astro components |
| **Cloud/Host** | Vercel | CI/CD and Edge Delivery |
| **Language** | TypeScript / SQL | Component logic and data transformation |

---

## Botanical Pipeline

The garden employs a logic-driven visual system. Each insight is assigned a botanical form based on its technical domain, determined by the `flower_type` metadata:

| Flower Type | Domain Focus | Symbolic Logic |
| :--- | :--- | :--- |
| **dandelion** | GenAI & Automation | Rapid propagation of ideas |
| **lavender** | MLOps & Processes | Organizational and structural rigor |
| **tulip** | Data Architecture | Foundation and organic scaling |
| **rose** | Leadership & Ethics | Multi-layered, deep-dive strategic content |
| **sunflower** | Strategy & ROI | Focus on business value and results |
| **fern** | Infrastructure | Resilient and structural growth |

---

## Development Workflow

The update cycle is fully automated via a data-driven pipeline:

1. **Input:** Create a new `.md` file within `src/content/garden/`.
2. **Metadata:** Define properties in the Frontmatter:
   ```markdown
   ---
   title: "Insight Title"
   category: "GenAI"
   flower_type: "fern"
   keyword: "Claude"
   ---
