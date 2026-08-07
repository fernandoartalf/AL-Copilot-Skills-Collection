# Changelog

All notable changes to the `bc-report-selection-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-30 - @fernandoartalf

### Added

- Initial `SKILL.md` covering the Business Central Report Selection
  extensibility pattern (table `77 "Report Selections"`,
  codeunit `77 "Report Selections"`, `Report Selection - Sales/Purchase/
  Service/Bank` pages, and the `Report Selection Usage` enum family).
- Five mandatory interview questions:
  - Target enum (global vs Sales / Purchase / Service / Bank)
  - Setup surface (dedicated setup page vs existing area page)
  - Print action target page and source record (conditional)
  - Default report seeding on install vs install-and-upgrade vs none
  - Number of new Usage values
- 9-step code generation workflow:
  - Read project metadata from `app.json`
  - Naming derivation rules with worked example
  - Feature-based folder layout matching existing workspace conventions
  - Enum extension generation with additive-only rules
  - Optional Report Selections list page with `FilterGroup(2)` lock
    and `OnNewRecord` `Usage` pre-fill (mirroring
    `Report Selection - Sales`)
  - Report Selection Management codeunit with
    `SetCurrentKey(Sequence)` + `FindSet` + `repeat`-`Report.RunModal`
    idiom and required error label when no report is configured
  - Optional PageExtension / Page action delegating to the management
    codeunit (never inline `Report.RunModal`)
  - Optional install codeunit that inserts a default `Report Selections`
    record only when the filtered set is empty
  - Optional upgrade codeunit guarded by an Upgrade Tag registered
    for new companies via `OnGetPerCompanyUpgradeTags`
- Reference templates under `references/`:
  - `enum-extension-template.md`
  - `report-selection-page-template.md`
  - `report-sel-mgmt-codeunit-template.md`
  - `page-action-template.md`
  - `install-codeunit-template.md`
  - `upgrade-codeunit-template.md`
  - `upgrade-tag-def-template.md`
- Base-application pattern cross-reference table linking each generated
  artefact to its inspiration in the Microsoft codebase.
- Twelve hard rules (affix usage, additive enum values, no comma in
  captions, no hardcoded `Report::"…"`, `SetCurrentKey(Sequence)`
  required, no silent fallback, insert-only-when-empty on seeding,
  upgrade-tag guarding, global vs area-specific enum awareness,
  `FilterGroup(2)` on setup pages, action-must-delegate, and
  compliance with `.github/instructions/` files).
- Anti-pattern list rejecting hardcoded `Report.RunModal` in triggers,
  renumbering published enum values, unconditional overwrite on
  install/upgrade, missing `FilterGroup(2)`, silent fallback, and
  wrong enum choice.
