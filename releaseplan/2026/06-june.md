# Release Plan — June 2026

> **Business Central 2026 Wave 1 — CU2**
> Aligned with Business Central cumulative update **v28.2**

---

## Overview

This release plan tracks proposed AL Copilot Skills for the **June 2026** contribution cycle.

Contributors: add your skill proposal below using the entry template. Once approved via Pull Request by the repository maintainer, begin development and submit the completed skill to `main` through a separate Pull Request.

---

## Proposed Skills

<!-- Copy the block below for each new skill proposal -->

### `bc-pricing-refactor`

| Field | Details |
|---|---|
| **Skill Name** | `bc-pricing-refactor` |
| **Short Description** | Guides AL developers through refactoring legacy sales pricing customizations from `Sales Price` and `Sales Line Discount` to the modern `Price List Header` and `Price List Line` architecture. Includes migration workflow, extensibility guidance, and validation scaffolds for the new pricing engine. |
### `bc-job-queue`

#### Author

- **Full Name**: Carlos Pérez
- **GitHub User**: cperezsx
- **GitHub Profile**: https://github.com/cperezsx
- **LinkedIn Profile**: https://www.linkedin.com/in/cperezsx/

#### Motivation

This skill addresses a repeatable migration problem for AL teams moving pricing customizations from the legacy pricing model to the current Price List architecture. It reduces re-discovery work around object mapping, feature enablement risks, migration extensibility points, and validation scenarios, while keeping the guidance runtime-agnostic.

---

| Field | Details |
|---|---|
| **Skill Name** | `bc-job-queue` |
| **Short Description** | Guides AL developers through creating, parameterizing, executing, retrying, and diagnosing Business Central Job Queue workloads. Includes decision rules for Job Queue versus other async primitives, parameter-contract guidance, recovery patterns, and telemetry-oriented troubleshooting. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Carlos Pérez
- **GitHub User**: cperezsx
- **GitHub Profile**: https://github.com/cperezsx
- **LinkedIn Profile**: https://www.linkedin.com/in/cperezsx/

#### Motivation

Business Central teams repeatedly need to implement or stabilize background processes, but Job Queue guidance is often fragmented across platform docs, Base Application APIs, and community troubleshooting posts. This skill consolidates those sources into one reusable workflow so an agent can choose the right async primitive, scaffold safe Job Queue code, define deterministic parameter contracts, and produce supportable monitoring guidance.

---

### `documentation-bc-user-story-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-user-story-generator` |
| **Short Description** | Generates Business Central user stories in the OpenSpec format through a structured interview, producing verifiable acceptance criteria, out-of-scope items, and Microsoft Learn–verified current-situation analysis, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Well-structured, verifiable user stories are the foundation of the OpenSpec documentation workflow, but they are often written with vague acceptance criteria or missing edge cases. This skill drives a structured interview, enforces testable acceptance criteria, runs a blind-spot and corner-case review, and produces a standardised user story file ready to feed the `documentation-bc-technical-spec-generator`.

---

### `documentation-bc-technical-spec-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-technical-spec-generator` |
| **Short Description** | Generates Business Central technical specifications from approved user stories, producing a full AL object inventory with workspace-derived IDs, table field definitions, page design notes, phased task breakdown, and technical acceptance criteria mapped to user-story ACs, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Translating an approved user story into a complete technical spec — with AL object IDs, field definitions, phase plans, and technical ACs — requires deep BC knowledge and is time-consuming to do correctly. This skill automates the structured decomposition while enforcing Microsoft Learn–verified BC behaviour and workspace-derived ID allocation, removing the risk of invented IDs or unsupported BC mechanisms.

---

### `documentation-bc-architecture-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-architecture-generator` |
| **Short Description** | Generates Business Central architecture documents with numbered Architecture Decision Records (ADRs), logical component views, runtime flows, data architecture, and cross-cutting concerns as the long-lived companion to an approved technical spec, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Technical specs describe what to build but rarely capture why specific design choices were made. This skill produces the architectural rationale document — ADRs, component views, cross-cutting concerns, and known constraints — that bridges the spec and the codebase, reducing knowledge loss when developers change and enabling future maintainability reviews without re-deriving design decisions from code.

---

### `documentation-bc-analysis-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-analysis-generator` |
| **Short Description** | Generates Business Central feasibility analysis documents covering SWOT analysis, numbered risk registers, Optimistic/Expected/Pessimistic time and cost estimates, and GO/NO-GO recommendations, as the analyst's working artefact backing a Change Control Note, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

AL teams repeatedly face effort estimation, cost forecasting, and risk analysis for change requests without a structured framework. This skill automates the SWOT analysis, risk register, and GO/NO-GO decision backed by verifiable estimates derived from the spec's phase decomposition, reducing re-discovery work and providing a reusable feasibility artefact that feeds directly into the CCN and the client sign-off process.

---

### `documentation-bc-phase-plan-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-phase-plan-generator` |
| **Short Description** | Generates the complete set of per-phase implementation plan files under `openspec/plans/` from an approved Business Central technical spec, translating the spec's object inventory and acceptance criteria into actionable checkbox task lists with phase dependencies, exit criteria, and developer notes. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

After a spec is approved, AL developers need a ready-to-execute task backlog broken into independently shippable phases. Manually translating spec sections into plan files is repetitive and often inconsistent in AC traceability and dependency mapping. This skill automates the generation of all phase plan files in a single invocation, enforcing proper `depends_on` chains, verifiable exit criteria, and task-to-AC citations that keep the backlog auditable throughout the sprint.

---

### `documentation-bc-ccn-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-ccn-generator` |
| **Short Description** | Generates Business Central Change Control Notes (CCNs) in any BCP-47 language, consolidating user stories, technical specs, architecture documents, and feasibility analyses into a single stakeholder-facing markdown document with embedded Mermaid diagram markers and a sibling JSON file ready for Word template conversion. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Change Control Notes must consolidate multiple source artefacts into a single client-ready document in any language. Manual assembly is error-prone, inconsistent, and requires re-deriving content already captured in the spec and analysis. This skill automates the consolidation, applies language translation only to content while keeping structural keys canonical for byte-stable Word template binding, and produces diagram markers that the `documentation-bc-md-to-docx-converter` renders as inline images.

---

### `documentation-bc-release-note-generator`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-release-note-generator` |
| **Short Description** | Generates Business Central release notes under `docs/releasenotesmd/` from an approved spec or CCN, producing a client-facing markdown document with release summary, scope of change, testing steps, known limitations, and approvals table, plus a sibling JSON file for Word template conversion. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Client-facing release notes must summarise deployed AL changes, testing steps, and approvals in a consistent format derived from spec and CCN artefacts, without hardcoding any company or client values. Manual authoring leads to missing sections, inconsistent quality, and duplicated effort across releases. This skill generates release notes from live workspace context — reading `app.json`, inventorying AL objects, and linking to the source CCN — with a sibling JSON output ready for Word template conversion.

---

### `documentation-bc-md-to-docx-converter`

| Field | Details |
|---|---|
| **Skill Name** | `documentation-bc-md-to-docx-converter` |
| **Short Description** | Converts Business Central documentation markdown files (user stories, specs, analyses, architectures, CCNs, release notes) to professionally formatted Word (.docx) documents using Python and corporate Word templates, with Mermaid diagram rendering via the Mermaid CLI and multi-language `{{Placeholder}}` substitution. |
| **Target BC Version** _(optional)_ | 28.2 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Documentation artefacts produced by the `documentation-bc-*` skill family are markdown files that need professional Word formatting for client delivery. Manual conversion is time-consuming and loses formatting consistency across documents and languages. This skill provides a Python-based pipeline with a unified field map registry, corporate Word templates with `{{Placeholder}}` tokens, Mermaid diagram rendering, and markdown-aware section body rendering — completing the automation chain from requirements discovery to client-deliverable Word document.

---

### `{skill-folder-name}`

| Field | Details |
|---|---|
| **Skill Name** | `{skill-folder-name}` |
| **Short Description** | _{One-to-two sentence description of what the skill does}_ |
| **Target BC Version** _(optional)_ | {BC Version}.{CU Number} |
| **Status** | 🟡 Proposed · 🟢 Approved · ✅ Merged · ✅ Merged |

#### Author

- **Full Name**: {Author full name}
- **GitHub User**: {github-username}
- **GitHub Profile**: https://github.com/{github-username}
- **LinkedIn Profile**: {LinkedIn URL}

#### Co-Authors _(optional)_

<!-- Add co-authors using the format below -->

- **Full Name**: {Co-author full name}
- **GitHub User**: {github-username}
- **GitHub Profile**: https://github.com/{github-username}
- **LinkedIn Profile**: {LinkedIn URL}

#### Motivation

_{Brief explanation of why this skill is needed and what problem it solves}_

---

<!-- END OF SKILL ENTRY — copy from ### to --- for additional entries -->

## Contribution Workflow

1. **Fork** the repository and create a branch from `main`.
2. **Add your skill entry** to the corresponding monthly plan file.
3. **Open a Pull Request** targeting `main` for plan approval.
4. **Wait for approval** from the repository maintainer (@fernandoartalf).
5. **Develop the skill** following the [skill creation instructions](../../instructions/skills-creation.instructions.md).
6. **Submit the completed skill** via a new Pull Request targeting `main`.

---

## Summary

| Skill | Author | Status |
|---|---|---|
| `bc-pricing-refactor` | `@cperezsx` | ✅ |
| `bc-job-queue` | `@cperezsx` | ✅ |
| `documentation-bc-user-story-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-technical-spec-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-architecture-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-analysis-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-phase-plan-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-ccn-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-release-note-generator` | `@fernandoartalf` | ✅ |
| `documentation-bc-md-to-docx-converter` | `@fernandoartalf` | ✅ |
| _{skill-name}_ | _@author_ | 🟡 / 🟢 / 🔵 / ✅ |
