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

### `bc-batch-processing`

| Field | Details |
|---|---|
| **Skill Name** | `bc-batch-processing` |
| **Short Description** | Implements batch processing patterns for Business Central to handle millions of records without timeouts. Includes batch-limited reports with auto-resume, progress tracking tables with time estimation, Job Queue integration, and monitoring pages. Production-validated on 2.5M records. |
| **Target BC Version** _(optional)_ | BC 27.0+ |
| **Status** | 🟡 Proposed |

#### Author

- **Full Name**: Alex Polo
- **Company**: WAU Technologies
- **GitHub User**: alexpolo
- **LinkedIn Profile**: https://www.linkedin.com/in/alexpolo

#### Co-Authors _(optional)_

<!-- None -->

#### Motivation

Processing large datasets (100K+ records) in Business Central often results in timeout errors after 12+ hours of execution. Common scenarios include post-migration data synchronization, bulk field updates, mass data cleanup, and one-time transformation tasks. While Microsoft documents Job Queue configuration and retry logic, there is no public documentation for batch-limiting patterns, progress tracking with time estimation, or the integration pattern connecting reports → progress tables → Job Queue → monitoring UI. This skill provides a complete, production-tested solution for multi-million record processing with automatic resumption, real-time progress visibility, accurate completion time estimates, and zero manual intervention. Extracted from a real customer implementation processing 2.5M records across 10 tables over 3 nights with zero timeouts.

---

<!-- END OF SKILL ENTRY — copy from ### to --- for additional entries -->

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
| _{skill-name}_ | _@author_ | 🟡 / 🟢 / 🔵 / ✅ |
