# Release Notes — May 2026

> **Business Central 2026 Wave 1 — CU1**  
> Aligned with Business Central cumulative update **v28.1**

---

## Overview

This release includes **2 new skills** contributed by **1 author** for the **May 2026** cycle. All skills follow the [Agent Skills](https://agentskills.io/) standard and are compatible with GitHub Copilot, Claude Code, and other agent platforms.

---

## Release Summary

| Metric | Count |
|---|---|
| **Total Skills Released** | 6 |
| **Contributors** | 3 |
| **Target BC Version(s)** | v28.1 |

---

## Skills by Author

### Fernando Artigas Alfonso

**Delivered**: 2 skills

**Author Information**:
- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Skills Contributed

##### 1. `bc-isolated-storage-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-isolated-storage-generator` |
| **Description** | Generates secure isolated storage patterns for Business Central extensions, including encryption/decryption helpers, secret management, and credential storage implementations following Microsoft security best practices. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/bc-isolated-storage-generator/`](../../skills/bc-isolated-storage-generator/) |

**What it does**: Generates all AL objects required to store secrets (API keys, passwords, tokens) using `IsolatedStorage` with encryption support, the correct `DataScope`, and a GUID key in a locked `Label`. Covers standalone setup tables, management codeunits, and optional setup pages with masked input fields.

---

##### 2. `bc-approval-workflow-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-approval-workflow-generator` |
| **Description** | Generates complete approval workflow implementation for custom tables in Business Central, including workflow templates, event subscriptions, approval entries integration, user setup validation, approval actions on pages, notification handling, and delegation logic following standard BC approval patterns. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/bc-approval-workflow-generator/`](../../skills/bc-approval-workflow-generator/) |

**What it does**: Produces the full set of objects required to integrate any BC entity into the built-in Workflow approval engine — Approval Status enum, table/table extension with deletion guard, approval management codeunit with all integration event subscribers, workflow setup codeunit for category and template registration, and page/page extension actions for Send and Cancel.

---

### Alex Polo

**Delivered**: 2 skills

**Author Information**:
- **Full Name**: Alex Polo
- **GitHub User**: AlexP0lo
- **GitHub Profile**: https://github.com/AlexP0lo
- **LinkedIn Profile**: https://www.linkedin.com/in/álex-polo-garrido-49343b140

#### Skills Contributed

##### 3. `onprem-remote-deploy`

| Field | Value |
|---|---|
| **Skill Name** | `onprem-remote-deploy` |
| **Description** | Deploys AL `.app` files to remote Business Central OnPrem servers from VS Code using WinRM, SSH, SMB, or RDP tsclient-pull strategies with fallback guidance for restricted networks. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/onprem-remote-deploy/`](../../skills/onprem-remote-deploy/) |

**What it does**: Covers multiple deployment strategies ranked by network access level — from fully blocked (tsclient-pull via RDP) to fully open (WinRM/SSH) — and automates script creation and scheduling for unattended deploys on remote BC OnPrem servers.

---

##### 4. `skill-contribution-assistant`

| Field | Value |
|---|---|
| **Skill Name** | `skill-contribution-assistant` |
| **Description** | Guides contributors to design, polish, and submit high-quality skills for the AL Copilot Skills Collection, including onboarding questions, non-intrusive opportunity detection, quality gates, and PR-readiness checks. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/skill-contribution-assistant/`](../../skills/skill-contribution-assistant/) |

**What it does**: Moves contributors from idea to PR-ready skill with consistent quality standards — defining focused and reusable skill scopes, applying repository conventions, and producing a complete PR package of skill files plus release plan entry.

---

### Carlos Perez

**Delivered**: 2 skills

**Author Information**:
- **Full Name**: Carlos Perez
- **GitHub User**: cperezsx
- **GitHub Profile**: https://github.com/cperezsx
- **LinkedIn Profile**: https://www.linkedin.com/in/cperezsx/

**Co-Author** (both skills):
- **Full Name**: Jose Miguel Dura
- **GitHub User**: JMDura
- **GitHub Profile**: https://github.com/JMDura
- **LinkedIn Profile**: https://www.linkedin.com/in/jose-miguel-durá-sirvent/

#### Skills Contributed

##### 5. `bc-reports`

| Field | Value |
|---|---|
| **Skill Name** | `bc-reports` |
| **Description** | Standards and guardrails for authoring Business Central reports in AL and RDLC. Covers report object structure, DataItem hierarchy, RDLC sizing, SetData/GetData index management, body width validation, and rendering best practices. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/bc-reports/`](../../skills/bc-reports/) |

**What it does**: Enforces correct patterns for AL report objects and RDLC layouts — DataItemLink, SetData index order, body width constraints, PageHeader/Footer sizing — before code reaches review, reducing rework and rendering failures.

---

##### 6. `bc-field-propagation`

| Field | Value |
|---|---|
| **Skill Name** | `bc-field-propagation` |
| **Description** | Propagates custom fields from source documents and journal lines to posted documents, archived documents, and ledger entries. Selects Pattern A (TransferFields — zero code) or Pattern B (EventSubscriber with dedicated codeunit per module) based on whether the posting codeunit uses TransferFields. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/bc-field-propagation/`](../../skills/bc-field-propagation/) |

**What it does**: Enforces the correct propagation pattern for Sales, Purchase, Transfer, and journal posting chains — using TransferFields where applicable and EventSubscribers only where necessary — with a complete event catalog for all major posting flows.

---

## All Skills in This Release

| # | Skill Name | Author | Target BC Version |
|---|---|---|---|
| 1 | `bc-isolated-storage-generator` | @fernandoartalf | v28.1 |
| 2 | `bc-approval-workflow-generator` | @fernandoartalf | v28.1 |
| 3 | `onprem-remote-deploy` | @AlexP0lo | v28.1 |
| 4 | `skill-contribution-assistant` | @AlexP0lo | v28.1 |
| 5 | `bc-reports` | @cperezsx, @JMDura | v28.1 |
| 6 | `bc-field-propagation` | @cperezsx, @JMDura | v28.1 |

---

## How to Use These Skills

1. **Copy the skill folder** from [`skills/`](../../skills/) to your project's skill directory:
   - GitHub Copilot: `.github/skills/`
   - Claude Code: `.claude/skills/`
   - Other agents: Check your agent's documentation

2. **Invoke your agent** — the skill will be loaded automatically when the task matches the skill's domain.

See the [main README](../../README.md) for detailed installation instructions.

---

## Related Release Plan

This release corresponds to the [**May 2026** release plan](../../releaseplan/2026/05-may.md).

---

## Contributors

Special thanks to all contributors who helped make this release possible:

- **Fernando Artigas Alfonso** ([@fernandoartalf](https://github.com/fernandoartalf)) — 2 skills
- **Alex Polo** ([@AlexP0lo](https://github.com/AlexP0lo)) — 2 skills
- **Carlos Perez** ([@cperezsx](https://github.com/cperezsx)) — 2 skills
- **Jose Miguel Dura** ([@JMDura](https://github.com/JMDura)) — co-author on 2 skills

---

## Feedback & Support

- Report issues: [GitHub Issues](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
- Ask questions: [GitHub Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions)
- Contribute: See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Release Date**: 2026-05-01  
**Status**: Released ✅
