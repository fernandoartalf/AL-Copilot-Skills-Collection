# Release Plan — May 2026

> **Business Central 2026 Wave 1 — CU1**
> Aligned with Business Central cumulative update **v28.1**

---

## Overview

This release plan tracks proposed AL Copilot Skills for the **May 2026** contribution cycle.

Contributors: add your skill proposal below using the entry template. Once approved via Pull Request by the repository maintainer, begin development and submit the completed skill to `main` through a separate Pull Request.

---

## Proposed Skills

<!-- Copy the block below for each new skill proposal -->

### `bc-isolated-storage-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-isolated-storage-generator` |
| **Short Description** | Generates secure isolated storage patterns for Business Central extensions, including encryption/decryption helpers, secret management, and credential storage implementations following Microsoft security best practices. |
| **Target BC Version** _(optional)_ | 28.1 |
| **Status** | 🟡 Proposed |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Co-Authors _(optional)_

<!-- Add co-authors using the format below -->

#### Motivation

Many AL extensions require secure storage of sensitive data like API keys, authentication tokens, connection strings, and user credentials. Business Central provides the Isolated Storage API for this purpose, but implementing it correctly with proper encryption, error handling, and secret rotation can be complex. This skill provides tested patterns and templates for secure credential management, helping developers implement security best practices without reinventing the wheel for each project.

---

<!-- END OF SKILL ENTRY — copy from ### to --- for additional entries -->

### `bc-approval-workflow-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-approval-workflow-generator` |
| **Short Description** | Generates complete approval workflow implementation for custom tables in Business Central, including workflow templates, event subscriptions, approval entries integration, user setup validation, approval actions on pages, notification handling, and delegation logic following standard BC approval patterns. |
| **Target BC Version** _(optional)_ | 28.1 |
| **Status** | 🟡 Proposed |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Co-Authors _(optional)_

<!-- Add co-authors using the format below -->

#### Motivation

Custom document tables (like custom purchase requisitions, expense reports, or custom orders) often require multi-level approval workflows similar to standard BC documents. Implementing approval workflows from scratch involves complex integration with BC's Approval Management system, including workflow templates, event conditions, responses, approval user setup, delegation, notification handling, and record status management. This skill automates the generation of all necessary objects following Microsoft's approval workflow architecture, enabling developers to quickly add enterprise-grade approval capabilities to custom tables without deep expertise in the approval framework internals.

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
| bc-isolated-storage-generator | @fernandoartalf | 🟡 Proposed |
| bc-approval-workflow-generator | @fernandoartalf | 🟡 Proposed |