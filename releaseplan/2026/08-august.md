# Release Plan — August 2026

> **Business Central 2026 Wave 1 — CU4**
> Aligned with Business Central cumulative update **v28.4**

---

## Overview

This release plan tracks proposed AL Copilot Skills for the **August 2026** contribution cycle.

Contributors: add your skill proposal below using the entry template. Once approved via Pull Request by the repository maintainer, begin development and submit the completed skill to `main` through a separate Pull Request.

---

## Proposed Skills

<!-- Copy the block below for each new skill proposal -->

### `bc-report-selection-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-report-selection-generator` |
| **Short Description** | Extends the Business Central Report Selection framework with new custom Usage values and wires them into the standard printing workflow. Creates enum extensions, a dedicated setup page, an initialisation/install/upgrade codeunit that seeds a default Report ID without overwriting customer configuration, a Report Selection Management codeunit, and page or page-extension actions that trigger the configured report. |
| **Target BC Version** _(optional)_ | 28.4 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

AL teams extending BC with custom document types repeatedly need to integrate their reports into the standard Report Selection framework — but the required pattern spans multiple objects (enum extension, Report Selections page, seeding codeunit, management codeunit, and page actions) and the correct runtime approach is non-obvious. This skill consolidates the full pattern, ensures Report IDs are never hardcoded, and covers the global and area-specific enum variants so developers can deliver a complete, upgrade-safe printing integration in a single agent invocation.

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
| `bc-report-selection-generator` | `@fernandoartalf` | ✅ |
| _{skill-name}_ | _@author_ | 🟡 / 🟢 / 🔵 / ✅ |
