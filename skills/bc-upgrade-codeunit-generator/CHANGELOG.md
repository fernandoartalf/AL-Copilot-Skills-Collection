# Changelog

All notable changes to the `bc-upgrade-codeunit-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-29 - @fernandoartalf

### Added

- Initial SKILL.md with upgrade codeunit generation patterns
- Upgrade trigger documentation (OnCheckPreconditions, OnUpgrade, OnValidate — PerCompany and PerDatabase)
- Trigger execution order reference table
- Version-based upgrade control using ModuleInfo.DataVersion
- Upgrade tags pattern using System Application Upgrade Tag module
- Three-codeunit pattern documentation (Upgrade, Upgrade Tag Definitions, Install integration)
- Upgrade tag naming convention: `[Prefix]-[ObjectID]-[Description]-[YYYYMMDD]`
- Common upgrade patterns: field migration, new table population, enum conversion, default seeding, archive restoration, precondition blocking, post-upgrade validation
- ExecutionContext guard pattern for protecting sensitive code during upgrades
- Version data properties reference table (AppVersion vs DataVersion in each context)
- Design guidelines (upgrade tags, Modify(false), SetLoadFields, safety checks, no UI, telemetry)
- Upgrade codeunit design workflow (10 steps)
- File naming convention and checklist
- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
- `references/upgrade-examples.md` with 7 full working examples:
  - Basic version-based upgrade with preconditions and validation
  - Upgrade with upgrade tags (recommended pattern) including companion codeunits
  - Database-level upgrade with dependency verification
  - Multi-step upgrade with telemetry logging
  - ExecutionContext guards for sensitive event subscribers
  - Fixing broken upgrades with new upgrade tags
  - Data archive restoration with NavApp.RestoreArchiveData
- Common anti-patterns section (missing tag guard, missing new company registration, missing install tag setting, Modify(true) during bulk migration, codeunit order dependency)
- Upgrade trigger execution order reference
- Install vs Upgrade comparison table
- PowerShell deployment commands reference
