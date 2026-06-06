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
| **Status** | 🔵 In Development |

#### Author

- **Full Name**: Carlos Pérez
- **GitHub User**: cperezsx
- **GitHub Profile**: https://github.com/cperezsx
- **LinkedIn Profile**: https://www.linkedin.com/in/cperezsx/

#### Motivation

Business Central teams repeatedly need to implement or stabilize background processes, but Job Queue guidance is often fragmented across platform docs, Base Application APIs, and community troubleshooting posts. This skill consolidates those sources into one reusable workflow so an agent can choose the right async primitive, scaffold safe Job Queue code, define deterministic parameter contracts, and produce supportable monitoring guidance.

---

### `{skill-folder-name}`

| Field | Details |
|---|---|
| **Skill Name** | `{skill-folder-name}` |
| **Short Description** | _{One-to-two sentence description of what the skill does}_ |
| **Target BC Version** _(optional)_ | {BC Version}.{CU Number} |
| **Status** | 🟡 Proposed · 🟢 Approved · 🔵 In Development · ✅ Merged |

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
| `bc-pricing-refactor` | `@cperezsx` | 🔵 |
| `bc-job-queue` | `@cperezsx` | 🔵 |
| _{skill-name}_ | _@author_ | 🟡 / 🟢 / 🔵 / ✅ |
