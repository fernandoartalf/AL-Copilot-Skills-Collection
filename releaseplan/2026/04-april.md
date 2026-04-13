# Release Plan — April 2026

> **Business Central 2026 Wave 1 — CU0**
> Aligned with Business Central cumulative update **v28.0**

---

## Overview

This release plan tracks proposed AL Copilot Skills for the **April 2026** contribution cycle.

Contributors: add your skill proposal below using the entry template. Once approved via Pull Request by the repository maintainer, begin development and submit the completed skill to `main` through a separate Pull Request.

---

## Proposed Skills

### `bc-api-page-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-api-page-generator` |
| **Short Description** | Generates RESTful API page objects for Business Central following API v2.0 and OData best practices. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Automates creation of production-ready API pages with proper field mappings, navigation properties, custom actions, validation, and permission sets.

---

### `bc-api-query-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-api-query-generator` |
| **Short Description** | Generates API query objects for Business Central that expose data via OData/REST endpoints using the QueryType = API pattern. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Creates production-ready API query objects with single or multiple dataitems, aggregation methods, filters, and DataItemLink joins for read-only API endpoints.

---

### `bc-attachments-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-attachments-generator` |
| **Short Description** | Implements standard document attachments, links, and notes on custom Business Central tables. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Automates BC standard document attachment functionality including event subscribers, table lifecycle triggers, and factbox integration for custom tables.

---

### `bc-business-events-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-business-events-generator` |
| **Short Description** | Implements external business events for Business Central enabling Power Automate and external system integrations. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Creates event-driven architecture for integrating BC with Power Automate, Dataverse, and external systems through ExternalBusinessEvent attributes and proper event subscribers.

---

### `bc-cds-page-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-cds-page-generator` |
| **Short Description** | Automatically generates AL list page objects for CDS (Dataverse) tables with standard CRM integration patterns. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Generates list pages with proper field layouts, CRM integration actions, coupling procedures, and initialization triggers for Dataverse entities.

---

### `bc-dataverse-entity-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-dataverse-entity-generator` |
| **Short Description** | Generates AL CDS integration table objects from Dataverse entities using ALTPGen with PowerShell automation scripts. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Fully automated workflow for generating BC table objects from Dataverse entities including table ID allocation, error fixing, file organization, and permission set updates.

---

### `bc-dataverse-mapping-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-dataverse-mapping-generator` |
| **Short Description** | Generates AL event subscriber code for Dataverse/CDS integration table and field mappings in Business Central. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Automates wiring up of Dataverse synchronization for both custom entities (full mapping) and OOB entities (extra field mappings) through event subscribers.

---

### `bc-install-codeunit-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-install-codeunit-generator` |
| **Short Description** | Generates install codeunits (Subtype = Install) for Business Central extensions that run code during first install or reinstall. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Creates production-ready install codeunits with first install detection, data initialization, reinstall scenarios, and proper separation of per-company vs per-database operations.

---

### `bc-number-series-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-number-series-generator` |
| **Short Description** | Implements automatic number series assignment for custom tables in Business Central following BC standard patterns. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Automates number series implementation with setup tables, table extensions with triggers, and UI integration for seamless number series management.

---

### `bc-setup-table-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-setup-table-generator` |
| **Short Description** | Generates setup table and page objects for Business Central following singleton pattern. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Creates single-record setup tables for module configuration with automatic initialization and performance-optimized access patterns using GetRecordOnce helper.

---

### `bc-setup-wizard-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-setup-wizard-generator` |
| **Short Description** | Generates assisted setup wizard pages for Business Central setup tables following Guided Experience patterns. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Automates creation of NavigatePage setup wizards with step-based navigation, banner images, temporary records, and Guided Experience registration.

---

### `bc-telemetry-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-telemetry-generator` |
| **Short Description** | Instruments Business Central AL codeunits with Application Insights telemetry using the System Application Telemetry codeunit. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Automates telemetry instrumentation with helper procedures for lifecycle events, error tracking, performance monitoring, feature usage analytics, and contextual telemetry.

---

### `bc-test-codeunit-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-test-codeunit-generator` |
| **Short Description** | Generates test codeunits (Subtype = Test) for Business Central extensions that verify existing module functionality. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Creates production-ready test codeunits and test runner codeunits with [Test] attribute methods, handler methods, and integration with standard BC test libraries.

---

### `bc-upgrade-codeunit-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-upgrade-codeunit-generator` |
| **Short Description** | Generates upgrade codeunits (Subtype = Upgrade) for Business Central extensions that run data migration code when upgrading to a new version. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Motivation

Handles data migration between versions with precondition validation, upgrade tag management using the System Application Upgrade Tag module, and post-upgrade verification.

---

## Contribution Workflow

1. **Fork** the repository and create a branch from `main`.
2. **Add your skill entry** to the corresponding monthly plan file.
3. **Open a Pull Request** targeting `main` for plan approval.
4. **Wait for approval** from the repository maintainer (@fernandoartalf).
5. **Develop the skill** following the [skill creation instructions](../../instructions/skills-creation.instructions.md).
6. **Submit the completed skill** via a new Pull Request targeting `main`.

---
### `bc-al-bug-fixer`

| Field | Details |
|---|---|
| **Skill Name** | `bc-al-bug-fixer` |
| **Short Description** | Diagnoses and fixes bugs in Business Central AL extensions following a structured triage workflow: symptom classification by layer, root cause mapping using a BC-specific failure catalogue, minimal targeted fix, and regression test definition. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Javier Armesto
- **GitHub User**: javiarmesto
- **GitHub Profile**: https://github.com/javiarmesto
- **LinkedIn Profile**: https://www.linkedin.com/in/jarmesto

#### Motivation

The AL compiler catches syntax errors but not the runtime bugs that cost the most debugging time: missing CalcFields calls, SetLoadFields truncation, silent event subscriber signature mismatches, or orphan records after delete. No existing skill in the collection covers BC-specific bug diagnosis. This skill imposes a diagnosis-first discipline — symptom → layer → root cause → minimal fix — with a catalogue of 7 symptom categories and 28 known failure modes mapped to their most likely root causes.

---

### `bc-al-code-reviewer`

| Field | Details |
|---|---|
| **Skill Name** | `bc-al-code-reviewer` |
| **Short Description** | Reviews Business Central AL extension code against a prioritized convention stack: AppSource validation requirements, CodeCop/PerTenantExtensionCop analyzer rules, alguidelines.dev community standards, and al-copilot-skills catalogue patterns. Audits five categories the AL compiler does not catch: naming and structure, performance anti-patterns, extensibility contract, SaaS readiness, and AppSource blockers. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Javier Armesto
- **GitHub User**: javiarmesto
- **GitHub Profile**: https://github.com/javiarmesto
- **LinkedIn Profile**: https://www.linkedin.com/in/jarmesto

#### Motivation

No existing skill in the collection covers pre-submission code review or AppSource readiness validation. Developers regularly ship extensions that compile cleanly but fail AppSource validation, behave incorrectly in SaaS, or break other ISV integrations due to missing extensibility contracts. This skill provides severity-classified findings (Blocker / Warning / Suggestion) with the exact rule source for every finding, covering 27 rules across 5 categories including 14 AppSource blockers with Microsoft documentation references.

---

### `bc-al-project-context`

| Field | Details |
|---|---|
| **Skill Name** | `bc-al-project-context` |
| **Short Description** | Maintains persistent project context for Business Central AL extensions across sessions, developers, and AI agents using two complementary mechanisms: Architecture Decision Records (ADRs) that capture why technical decisions were made, and Session Handoff documents that capture the current project state with an immediate next action as the primary output. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Javier Armesto
- **GitHub User**: javiarmesto
- **GitHub Profile**: https://github.com/javiarmesto
- **LinkedIn Profile**: https://www.linkedin.com/in/jarmesto

#### Motivation

Context loss is one of the most expensive problems in AL development with AI agents. Decisions made in one session disappear by the next. New developers or agents onboarding to a project have no structured way to understand why things are designed the way they are. ADRs are a well-established practice in software engineering but almost nonexistent in BC projects. This skill brings both ADRs and structured session handoffs to the BC AL ecosystem, with file-based storage in `.github/decisions/` and `.github/context/` — version-controlled and readable by any developer or AI agent without special tooling.

---

### `bc-manifest-handoff-generator`

| Field | Details |
|---|---|
| **Skill Name** | `bc-manifest-handoff-generator` |
| **Short Description** | Generates a handoff manifest at the end of the ALDC pipeline so that CIRCE and/or DELFOS can consume the extension's published surface without sharing a workspace. Creates a single markdown manifest containing MCP connection context for CIRCE, published API pages and queries for DELFOS, data structure details, and star schema hints. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Javier Armesto
- **GitHub User**: javiarmesto
- **GitHub Profile**: https://github.com/javiarmesto
- **LinkedIn Profile**: https://www.linkedin.com/in/jarmesto

#### Motivation

After the Conductor pipeline completes and all tests pass, there is no standardized way to hand off the extension's published surface to downstream frameworks like CIRCE (Copilot Studio agent builder) or DELFOS (Power BI dashboard builder). This skill generates a single manifest containing API pages, queries, data structures, and connection context so that consuming agents can work without sharing a workspace.

---

### `bc-agent-instructions-debugger`

| Field | Details |
|---|---|
| **Skill Name** | `bc-agent-instructions-debugger` |
| **Short Description** | Audits and diagnoses Business Central agent instruction files (InstructionsV1.txt or InstructionsV2.txt) to identify why an agent is not behaving as expected, and produces a structured diagnosis report plus a corrected version of the instructions. Covers pre-publication review and post-deployment debugging. |
| **Target BC Version** _(optional)_ | v28.0 |
| **Status** | ✅ Merged |

#### Author

- **Full Name**: Javier Armesto
- **GitHub User**: javiarmesto
- **GitHub Profile**: https://github.com/javiarmesto
- **LinkedIn Profile**: https://www.linkedin.com/in/jarmesto

#### Motivation

BC agents built with Copilot Studio rely on instruction files that follow a specific runtime keyword contract and the Responsibilities-Guidelines-Instructions framework. When an agent misbehaves — loses context between pages, ignores guidelines, fails to invoke actions, or gets stuck in loops — there is no structured way to diagnose the root cause. This skill analyzes instruction files against known anti-patterns and the runtime model, producing severity-classified findings with minimal targeted fixes.

---
## Summary

| Skill | Author | Status |
|---|---|---|
| `bc-api-page-generator` | @fernandoartalf | ✅ |
| `bc-api-query-generator` | @fernandoartalf | ✅ |
| `bc-attachments-generator` | @fernandoartalf | ✅ |
| `bc-business-events-generator` | @fernandoartalf | ✅ |
| `bc-cds-page-generator` | @fernandoartalf | ✅ |
| `bc-dataverse-entity-generator` | @fernandoartalf | ✅ |
| `bc-dataverse-mapping-generator` | @fernandoartalf | ✅ |
| `bc-install-codeunit-generator` | @fernandoartalf | ✅ |
| `bc-number-series-generator` | @fernandoartalf | ✅ |
| `bc-setup-table-generator` | @fernandoartalf | ✅ |
| `bc-setup-wizard-generator` | @fernandoartalf | ✅ |
| `bc-telemetry-generator` | @fernandoartalf | ✅ |
| `bc-test-codeunit-generator` | @fernandoartalf | ✅ |
| `bc-upgrade-codeunit-generator` | @fernandoartalf | ✅ |
| `bc-al-bug-fixer` | @javiarmesto | ✅ |
| `bc-al-code-reviewer` | @javiarmesto | ✅ |
| `bc-al-project-context` | @javiarmesto | ✅ |
| `bc-manifest-handoff-generator` | @javiarmesto | ✅ |
| `bc-agent-instructions-debugger` | @javiarmesto | ✅ |
