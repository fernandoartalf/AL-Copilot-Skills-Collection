# Release Plan — November 2026

> **Business Central 2026 Wave 2 — CU1**
> Aligned with Business Central cumulative update **v29.1**

---

## Overview

This release plan tracks proposed AL Copilot Skills for the **November 2026** contribution cycle.

Contributors: add your skill proposal below using the entry template. Once approved via Pull Request by the repository maintainer, begin development and submit the completed skill to `main` through a separate Pull Request.

---

## Proposed Skills

<!-- Copy the block below for each new skill proposal -->

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

### `bc-dataverse-entity-generator` (update)

| Field | Details |
|---|---|
| **Skill Name** | `bc-dataverse-entity-generator` |
| **Short Description** | Updates Dataverse entity generation to install altpgen from NuGet, select a supported .NET runtime, persist configuration outside the repository, allocate table IDs from `app.json`, and generate one or multiple entities. Adds guidance for merging existing tables, permissions, and troubleshooting. |
| **Target BC Version** _(optional)_ | v29.1 |
| **Status** | 🔵 In Development |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

The update replaces reliance on the AL extension's bundled altpgen with a maintained NuGet installation workflow and makes generation safer to repeat through persisted settings, `app.json`-based ID allocation, and explicit merge and permission-set guidance.

---

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
| `bc-dataverse-entity-generator` (update) | @fernandoartalf | 🔵 |
