# Changelog

All notable changes to the `cds-table-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-18

### Changed

- Renamed skill from `bc-dataverse-entity-generator` to `cds-table-generator`
- Refactored SKILL.md from ~700 lines to ~135 lines for faster loading
- Moved full PowerShell scripts to `references/generate-entity-script.md` and `references/generate-entity-list-script.md`
- Moved interaction patterns, merge strategy, entity reference table, and troubleshooting to `references/workflow-examples.md`
- Condensed 10-step workflow to 7 focused steps
- Added trigger phrase "create a Dataverse integration table"

### Added

- Sensitive Configuration table highlighting `$ServiceUri`, `$ClientId`, `$RedirectUri`, `$AltpgenPath` with sensitivity levels
- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
- Progressive disclosure via `references/` directory

### Removed

- Redundant "When to Use" section (covered by description trigger phrases)
- Verbose interaction pattern examples (moved to references)
- Complete Automation Example script (condensed into workflow steps)
- Footer metadata (superseded by this changelog)

## [1.0.0] - 2026-01-19

### Added

- Initial skill creation
- 10-step core workflow with ALTPGen integration
- PowerShell scripts for single and batch entity generation
- BCS naming convention automation
- Existing table merge strategy with field comparison
- Permission set update automation
- User interaction patterns (simple, update, multiple, error handling)
- Common Dataverse entity reference table
- Troubleshooting guide (6 common issues)
- Best practices list
