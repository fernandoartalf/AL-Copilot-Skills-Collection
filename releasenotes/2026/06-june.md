# Release Notes — June 2026

> **Business Central 2026 Wave 1 — CU2**  
> Aligned with Business Central cumulative update **v28.2**

---

## Overview

This release includes **10 new skills** contributed by **2 authors** for the **June 2026** cycle. All skills follow the [Agent Skills](https://agentskills.io/) standard and are compatible with GitHub Copilot, Claude Code, and other agent platforms.

---

## Release Summary

| Metric | Count |
|---|---|
| **Total Skills Released** | 10 |
| **Contributors** | 2 |
| **Target BC Version(s)** | v28.2 |

---

## Skills by Author

### Fernando Artigas Alfonso

**Delivered**: 8 skills

**Author Information**:
- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Skills Contributed

##### 1. `documentation-bc-user-story-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-user-story-generator` |
| **Description** | Generates Business Central user stories in the OpenSpec format through a structured interview, producing verifiable acceptance criteria, out-of-scope items, and Microsoft Learn–verified current-situation analysis, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-user-story-generator/`](../../skills/documentation-bc-user-story-generator/) |

**What it does**: Well-structured, verifiable user stories are the foundation of the OpenSpec documentation workflow, but they are often written with vague acceptance criteria or missing edge cases. This skill drives a structured interview, enforces testable acceptance criteria, runs a blind-spot and corner-case review, and produces a standardised user story file ready to feed the `documentation-bc-technical-spec-generator`.

---

##### 2. `documentation-bc-technical-spec-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-technical-spec-generator` |
| **Description** | Generates Business Central technical specifications from approved user stories, producing a full AL object inventory with workspace-derived IDs, table field definitions, page design notes, phased task breakdown, and technical acceptance criteria mapped to user-story ACs, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-technical-spec-generator/`](../../skills/documentation-bc-technical-spec-generator/) |

**What it does**: Translating an approved user story into a complete technical spec — with AL object IDs, field definitions, phase plans, and technical ACs — requires deep BC knowledge and is time-consuming to do correctly. This skill automates the structured decomposition while enforcing Microsoft Learn–verified BC behaviour and workspace-derived ID allocation, removing the risk of invented IDs or unsupported BC mechanisms.

---

##### 3. `documentation-bc-architecture-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-architecture-generator` |
| **Description** | Generates Business Central architecture documents with numbered Architecture Decision Records (ADRs), logical component views, runtime flows, data architecture, and cross-cutting concerns as the long-lived companion to an approved technical spec, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-architecture-generator/`](../../skills/documentation-bc-architecture-generator/) |

**What it does**: Technical specs describe what to build but rarely capture why specific design choices were made. This skill produces the architectural rationale document — ADRs, component views, cross-cutting concerns, and known constraints — that bridges the spec and the codebase, reducing knowledge loss when developers change and enabling future maintainability reviews without re-deriving design decisions from code.

---

##### 4. `documentation-bc-analysis-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-analysis-generator` |
| **Description** | Generates Business Central feasibility analysis documents covering SWOT analysis, numbered risk registers, Optimistic/Expected/Pessimistic time and cost estimates, and GO/NO-GO recommendations, as the analyst's working artefact backing a Change Control Note, with a sibling JSON file for downstream Word template conversion. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-analysis-generator/`](../../skills/documentation-bc-analysis-generator/) |

**What it does**: AL teams repeatedly face effort estimation, cost forecasting, and risk analysis for change requests without a structured framework. This skill automates the SWOT analysis, risk register, and GO/NO-GO decision backed by verifiable estimates derived from the spec's phase decomposition, reducing re-discovery work and providing a reusable feasibility artefact that feeds directly into the CCN and the client sign-off process.

---

##### 5. `documentation-bc-phase-plan-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-phase-plan-generator` |
| **Description** | Generates the complete set of per-phase implementation plan files under `openspec/plans/` from an approved Business Central technical spec, translating the spec's object inventory and acceptance criteria into actionable checkbox task lists with phase dependencies, exit criteria, and developer notes. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-phase-plan-generator/`](../../skills/documentation-bc-phase-plan-generator/) |

**What it does**: After a spec is approved, AL developers need a ready-to-execute task backlog broken into independently shippable phases. Manually translating spec sections into plan files is repetitive and often inconsistent in AC traceability and dependency mapping. This skill automates the generation of all phase plan files in a single invocation, enforcing proper `depends_on` chains, verifiable exit criteria, and task-to-AC citations that keep the backlog auditable throughout the sprint.

---

##### 6. `documentation-bc-ccn-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-ccn-generator` |
| **Description** | Generates Business Central Change Control Notes (CCNs) in any BCP-47 language, consolidating user stories, technical specs, architecture documents, and feasibility analyses into a single stakeholder-facing markdown document with embedded Mermaid diagram markers and a sibling JSON file ready for Word template conversion. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-ccn-generator/`](../../skills/documentation-bc-ccn-generator/) |

**What it does**: Change Control Notes must consolidate multiple source artefacts into a single client-ready document in any language. Manual assembly is error-prone, inconsistent, and requires re-deriving content already captured in the spec and analysis. This skill automates the consolidation, applies language translation only to content while keeping structural keys canonical for byte-stable Word template binding, and produces diagram markers that the `documentation-bc-md-to-docx-converter` renders as inline images.

---

##### 7. `documentation-bc-release-note-generator`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-release-note-generator` |
| **Description** | Generates Business Central release notes under `docs/releasenotesmd/` from an approved spec or CCN, producing a client-facing markdown document with release summary, scope of change, testing steps, known limitations, and approvals table, plus a sibling JSON file for Word template conversion. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-release-note-generator/`](../../skills/documentation-bc-release-note-generator/) |

**What it does**: Client-facing release notes must summarise deployed AL changes, testing steps, and approvals in a consistent format derived from spec and CCN artefacts, without hardcoding any company or client values. Manual authoring leads to missing sections, inconsistent quality, and duplicated effort across releases. This skill generates release notes from live workspace context — reading `app.json`, inventorying AL objects, and linking to the source CCN — with a sibling JSON output ready for Word template conversion.

---

##### 8. `documentation-bc-md-to-docx-converter`

| Field | Value |
|---|---|
| **Skill Name** | `documentation-bc-md-to-docx-converter` |
| **Description** | Converts Business Central documentation markdown files (user stories, specs, analyses, architectures, CCNs, release notes) to professionally formatted Word (.docx) documents using Python and corporate Word templates, with Mermaid diagram rendering via the Mermaid CLI and multi-language `{{Placeholder}}` substitution. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/documentation-bc-md-to-docx-converter/`](../../skills/documentation-bc-md-to-docx-converter/) |

**What it does**: Documentation artefacts produced by the `documentation-bc-*` skill family are markdown files that need professional Word formatting for client delivery. Manual conversion is time-consuming and loses formatting consistency across documents and languages. This skill provides a Python-based pipeline with a unified field map registry, corporate Word templates with `{{Placeholder}}` tokens, Mermaid diagram rendering, and markdown-aware section body rendering — completing the automation chain from requirements discovery to client-deliverable Word document.

---

### Carlos Pérez

**Delivered**: 2 skills

**Author Information**:
- **Full Name**: Carlos Pérez
- **GitHub User**: cperezsx
- **GitHub Profile**: https://github.com/cperezsx
- **LinkedIn Profile**: https://www.linkedin.com/in/cperezsx/

#### Skills Contributed

##### 9. `bc-pricing-refactor`

| Field | Value |
|---|---|
| **Skill Name** | `bc-pricing-refactor` |
| **Description** | Guides AL developers through refactoring legacy sales pricing customizations from `Sales Price` and `Sales Line Discount` to the modern `Price List Header` and `Price List Line` architecture. Includes migration workflow, extensibility guidance, and validation scaffolds for the new pricing engine. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/bc-pricing-refactor/`](../../skills/bc-pricing-refactor/) |

**What it does**: This skill addresses a repeatable migration problem for AL teams moving pricing customizations from the legacy pricing model to the current Price List architecture. It reduces re-discovery work around object mapping, feature enablement risks, migration extensibility points, and validation scenarios, while keeping the guidance runtime-agnostic.

---

##### 10. `bc-job-queue`

| Field | Value |
|---|---|
| **Skill Name** | `bc-job-queue` |
| **Description** | Guides AL developers through creating, parameterizing, executing, retrying, and diagnosing Business Central Job Queue workloads. Includes decision rules for Job Queue versus other async primitives, parameter-contract guidance, recovery patterns, and telemetry-oriented troubleshooting. |
| **Target BC Version** | v28.2 |
| **Folder** | [`skills/bc-job-queue/`](../../skills/bc-job-queue/) |

**What it does**: Business Central teams repeatedly need to implement or stabilize background processes, but Job Queue guidance is often fragmented across platform docs, Base Application APIs, and community troubleshooting posts. This skill consolidates those sources into one reusable workflow so an agent can choose the right async primitive, scaffold safe Job Queue code, define deterministic parameter contracts, and produce supportable monitoring guidance.

---

## All Skills in This Release

| # | Skill Name | Author | Target BC Version |
|---|---|---|---|
| 1 | `documentation-bc-user-story-generator` | @fernandoartalf | v28.2 |
| 2 | `documentation-bc-technical-spec-generator` | @fernandoartalf | v28.2 |
| 3 | `documentation-bc-architecture-generator` | @fernandoartalf | v28.2 |
| 4 | `documentation-bc-analysis-generator` | @fernandoartalf | v28.2 |
| 5 | `documentation-bc-phase-plan-generator` | @fernandoartalf | v28.2 |
| 6 | `documentation-bc-ccn-generator` | @fernandoartalf | v28.2 |
| 7 | `documentation-bc-release-note-generator` | @fernandoartalf | v28.2 |
| 8 | `documentation-bc-md-to-docx-converter` | @fernandoartalf | v28.2 |
| 9 | `bc-pricing-refactor` | @cperezsx | v28.2 |
| 10 | `bc-job-queue` | @cperezsx | v28.2 |
