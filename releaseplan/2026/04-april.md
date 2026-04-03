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
