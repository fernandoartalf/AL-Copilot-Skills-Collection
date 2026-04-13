# Release Notes — April 2026

> **Business Central 2026 Wave 1 — CU0**  
> Aligned with Business Central cumulative update **v28.0**

---

## Overview

This release includes **18 new skills** contributed by **2 authors** for the **April 2026** cycle. All skills follow the [Agent Skills](https://agentskills.io/) standard and are compatible with GitHub Copilot, Claude Code, and other agent platforms.

---

## Release Summary

| Metric | Count |
|---|---|
| **Total Skills Released** | 18 |
| **Contributors** | 2 |
| **Target BC Version(s)** | v28.0 |

---

## Skills by Author

### Fernando Artigas Alfonso

**Delivered**: 14 skills

**Author Information**:
- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Skills Contributed

##### 1. `bc-api-page-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-api-page-generator` |
| **Description** | Generates RESTful API page objects for Business Central following API v2.0 and OData best practices. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-api-page-generator/`](../../skills/bc-api-page-generator/) |

**What it does**: Automates creation of production-ready API pages with proper field mappings, navigation properties, custom actions, validation, and permission sets.

---

##### 2. `bc-api-query-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-api-query-generator` |
| **Description** | Generates API query objects for Business Central that expose data via OData/REST endpoints using the QueryType = API pattern. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-api-query-generator/`](../../skills/bc-api-query-generator/) |

**What it does**: Creates production-ready API query objects with single or multiple dataitems, aggregation methods, filters, and DataItemLink joins for read-only API endpoints.

---

##### 3. `bc-attachments-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-attachments-generator` |
| **Description** | Implements standard document attachments, links, and notes on custom Business Central tables. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-attachments-generator/`](../../skills/bc-attachments-generator/) |

**What it does**: Automates BC standard document attachment functionality including event subscribers, table lifecycle triggers, and factbox integration for custom tables.

---

##### 4. `bc-business-events-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-business-events-generator` |
| **Description** | Implements external business events for Business Central enabling Power Automate and external system integrations. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-business-events-generator/`](../../skills/bc-business-events-generator/) |

**What it does**: Creates event-driven architecture for integrating BC with Power Automate, Dataverse, and external systems through ExternalBusinessEvent attributes and proper event subscribers.

---

##### 5. `bc-cds-page-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-cds-page-generator` |
| **Description** | Automatically generates AL list page objects for CDS (Dataverse) tables with standard CRM integration patterns. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-cds-page-generator/`](../../skills/bc-cds-page-generator/) |

**What it does**: Generates list pages with proper field layouts, CRM integration actions, coupling procedures, and initialization triggers for Dataverse entities.

---

##### 6. `bc-dataverse-entity-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-dataverse-entity-generator` |
| **Description** | Generates AL CDS integration table objects from Dataverse entities using ALTPGen with PowerShell automation scripts. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-dataverse-entity-generator/`](../../skills/bc-dataverse-entity-generator/) |

**What it does**: Fully automated workflow for generating BC table objects from Dataverse entities including table ID allocation, error fixing, file organization, and permission set updates.

---

##### 7. `bc-dataverse-mapping-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-dataverse-mapping-generator` |
| **Description** | Generates AL event subscriber code for Dataverse/CDS integration table and field mappings in Business Central. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-dataverse-mapping-generator/`](../../skills/bc-dataverse-mapping-generator/) |

**What it does**: Automates wiring up of Dataverse synchronization for both custom entities (full mapping) and OOB entities (extra field mappings) through event subscribers.

---

##### 8. `bc-install-codeunit-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-install-codeunit-generator` |
| **Description** | Generates install codeunits (Subtype = Install) for Business Central extensions that run code during first install or reinstall. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-install-codeunit-generator/`](../../skills/bc-install-codeunit-generator/) |

**What it does**: Creates production-ready install codeunits with first install detection, data initialization, reinstall scenarios, and proper separation of per-company vs per-database operations.

---

##### 9. `bc-number-series-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-number-series-generator` |
| **Description** | Implements automatic number series assignment for custom tables in Business Central following BC standard patterns. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-number-series-generator/`](../../skills/bc-number-series-generator/) |

**What it does**: Automates number series implementation with setup tables, table extensions with triggers, and UI integration for seamless number series management.

---

##### 10. `bc-setup-table-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-setup-table-generator` |
| **Description** | Generates setup table and page objects for Business Central following singleton pattern. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-setup-table-generator/`](../../skills/bc-setup-table-generator/) |

**What it does**: Creates single-record setup tables for module configuration with automatic initialization and performance-optimized access patterns using GetRecordOnce helper.

---

##### 11. `bc-setup-wizard-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-setup-wizard-generator` |
| **Description** | Generates assisted setup wizard pages for Business Central setup tables following Guided Experience patterns. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-setup-wizard-generator/`](../../skills/bc-setup-wizard-generator/) |

**What it does**: Automates creation of NavigatePage setup wizards with step-based navigation, banner images, temporary records, and Guided Experience registration.

---

##### 12. `bc-telemetry-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-telemetry-generator` |
| **Description** | Instruments Business Central AL codeunits with Application Insights telemetry using the System Application Telemetry codeunit. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-telemetry-generator/`](../../skills/bc-telemetry-generator/) |

**What it does**: Automates telemetry instrumentation with helper procedures for lifecycle events, error tracking, performance monitoring, feature usage analytics, and contextual telemetry.

---

##### 13. `bc-test-codeunit-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-test-codeunit-generator` |
| **Description** | Generates test codeunits (Subtype = Test) for Business Central extensions that verify existing module functionality. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-test-codeunit-generator/`](../../skills/bc-test-codeunit-generator/) |

**What it does**: Creates production-ready test codeunits and test runner codeunits with [Test] attribute methods, handler methods, and integration with standard BC test libraries.

---

##### 14. `bc-upgrade-codeunit-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-upgrade-codeunit-generator` |
| **Description** | Generates upgrade codeunits (Subtype = Upgrade) for Business Central extensions that run data migration code when upgrading to a new version. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-upgrade-codeunit-generator/`](../../skills/bc-upgrade-codeunit-generator/) |

**What it does**: Handles data migration between versions with precondition validation, upgrade tag management using the System Application Upgrade Tag module, and post-upgrade verification.

---

### Javier Armesto

**Delivered**: 4 skills

**Author Information**:
- **Full Name**: Javier Armesto
- **GitHub User**: javiarmesto
- **GitHub Profile**: https://github.com/javiarmesto
- **LinkedIn Profile**: https://www.linkedin.com/in/jarmesto

#### Skills Contributed

##### 1. `bc-al-bug-fix`

| Field | Value |
|---|---|
| **Skill Name** | `bc-al-bug-fix` |
| **Description** | Diagnoses and fixes bugs in Business Central AL extensions following a structured triage workflow: symptom classification by layer, root cause mapping, minimal targeted fix, and regression test definition. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-al-bug-fix/`](../../skills/bc-al-bug-fix/) |

**What it does**: Imposes a diagnosis-first discipline — symptom → layer → root cause → minimal fix — with a catalogue of 7 symptom categories and 28 known failure modes mapped to their most likely root causes.

---

##### 2. `bc-al-code-reviewer`

| Field | Value |
|---|---|
| **Skill Name** | `bc-al-code-reviewer` |
| **Description** | Reviews Business Central AL extension code against a prioritized convention stack: AppSource validation requirements, CodeCop/PerTenantExtensionCop analyzer rules, alguidelines.dev community standards, and al-copilot-skills catalogue patterns. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-al-code-reviewer/`](../../skills/bc-al-code-reviewer/) |

**What it does**: Audits five categories the AL compiler does not catch: naming and structure, performance anti-patterns, extensibility contract, SaaS readiness, and AppSource blockers. Produces severity-classified findings covering 27 rules across 5 categories.

---

##### 3. `bc-al-project-context`

| Field | Value |
|---|---|
| **Skill Name** | `bc-al-project-context` |
| **Description** | Maintains persistent project context for Business Central AL extensions across sessions, developers, and AI agents using Architecture Decision Records (ADRs) and Session Handoff documents. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-al-project-context/`](../../skills/bc-al-project-context/) |

**What it does**: Brings ADRs and structured session handoffs to the BC AL ecosystem, with file-based storage in `.github/decisions/` and `.github/context/` — version-controlled and readable by any developer or AI agent.

---

##### 4. `bc-manifest-handoff-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-manifest-handoff-generator` |
| **Description** | Generates a handoff manifest at the end of the ALDC pipeline so that CIRCE and/or DELFOS can consume the extension's published surface without sharing a workspace. |
| **Target BC Version** | v28.0 |
| **Folder** | [`skills/bc-manifest-handoff-generator/`](../../skills/bc-manifest-handoff-generator/) |

**What it does**: Creates a single manifest containing MCP connection context for CIRCE, published API pages and queries for DELFOS, data structure details, and star schema hints.

---

## All Skills in This Release

| # | Skill Name | Author | Target BC Version |
|---|---|---|---|
| 1 | `bc-api-page-generator` | @fernandoartalf | v28.0 |
| 2 | `bc-api-query-generator` | @fernandoartalf | v28.0 |
| 3 | `bc-attachments-generator` | @fernandoartalf | v28.0 |
| 4 | `bc-business-events-generator` | @fernandoartalf | v28.0 |
| 5 | `bc-cds-page-generator` | @fernandoartalf | v28.0 |
| 6 | `bc-dataverse-entity-generator` | @fernandoartalf | v28.0 |
| 7 | `bc-dataverse-mapping-generator` | @fernandoartalf | v28.0 |
| 8 | `bc-install-codeunit-generator` | @fernandoartalf | v28.0 |
| 9 | `bc-number-series-generator` | @fernandoartalf | v28.0 |
| 10 | `bc-setup-table-generator` | @fernandoartalf | v28.0 |
| 11 | `bc-setup-wizard-generator` | @fernandoartalf | v28.0 |
| 12 | `bc-telemetry-generator` | @fernandoartalf | v28.0 |
| 13 | `bc-test-codeunit-generator` | @fernandoartalf | v28.0 |
| 14 | `bc-upgrade-codeunit-generator` | @fernandoartalf | v28.0 |
| 15 | `bc-al-bug-fix` | @javiarmesto | v28.0 |
| 16 | `bc-al-code-reviewer` | @javiarmesto | v28.0 |
| 17 | `bc-al-project-context` | @javiarmesto | v28.0 |
| 18 | `bc-manifest-handoff-generator` | @javiarmesto | v28.0 |

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

This release corresponds to the [**April 2026** release plan](../../releaseplan/2026/04-april.md).

---

## Contributors

Special thanks to all contributors who helped make this release possible:

- **Fernando Artigas Alfonso** ([@fernandoartalf](https://github.com/fernandoartalf)) — 14 skills
- **Javier Armesto** ([@javiarmesto](https://github.com/javiarmesto)) — 4 skills

---

## Feedback & Support

- Report issues: [GitHub Issues](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
- Ask questions: [GitHub Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions)
- Contribute: See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Release Date**: 2026-04-01  
**Status**: Released ✅
