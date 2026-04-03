# Changelog

All notable changes to the `bc-install-codeunit-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-29 - @fernandoartalf

### Added

- Initial SKILL.md with install codeunit generation patterns
- Install trigger documentation (OnInstallAppPerCompany, OnInstallAppPerDatabase)
- Fresh install vs reinstall detection using ModuleInfo.DataVersion
- ModuleInfo properties reference table
- Common install patterns: setup initialization, default values, reference data seeding, reinstall patching, telemetry
- Design guidelines (idempotency, no UI, error handling, multi-codeunit independence)
- Install codeunit design workflow (6 steps)
- File naming convention and checklist
- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
- `references/install-examples.md` with 5 full working examples:
  - Basic fresh install and reinstall detection
  - Setup table initialization with defaults
  - Install with telemetry logging
  - Multi-table data initialization
  - Database-only install with feature key registration
- Common anti-patterns section (UI interaction, non-idempotent inserts, order dependency)
- Install vs Upgrade comparison table
