# Release Plan — October 2026

> **Business Central 2026 Wave 2 — CU0**
> Aligned with Business Central cumulative update **v29.0**

---

## Overview

This release plan tracks proposed AL Copilot Skills for the **October 2026** contribution cycle.

Contributors: add your skill proposal below using the entry template. Once approved via Pull Request by the repository maintainer, begin development and submit the completed skill to `main` through a separate Pull Request.

---

## Proposed Skills

<!-- Copy the block below for each new skill proposal -->

### `bc-table-dimensions-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-table-dimensions-generator` |
| **Short Description** | Adds Business Central standard dimension support to custom tables and their pages following DimensionManagement patterns. Generates Shortcut Dimension 1/2 Code and Dimension Set ID fields, validation and Show Dimensions procedures, a card-page Dimensions group with visibility driven by General Ledger Setup, list-page dimension columns, and default-dimension inheritance from master data (standard merge or single source with fallback), including header-to-line cascading. |
| **Target BC Version** _(optional)_ | 29.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Custom documents and worksheets that need financial analysis must be dimension-aware, but the standard pattern spans table fields, validation procedures, page visibility rules, and default-dimension inheritance from several master data tables, with two distinct inheritance strategies. This skill consolidates the full pattern so developers can make a custom table dimension-aware consistently and in a single agent invocation.

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
| `bc-table-dimensions-generator` | `@fernandoartalf` | ✅ |
| _{skill-name}_ | _@author_ | 🟡 / 🟢 / 🔵 / ✅ |
