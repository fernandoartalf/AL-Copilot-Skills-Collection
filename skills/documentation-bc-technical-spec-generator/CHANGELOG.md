# Changelog

All notable changes to the `documentation-bc-technical-spec-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Workflow starting from an approved user story (`status: approved`) in `openspec/user-stories/`
- Spec output written as `<kebab-title>.spec.md` under `openspec/specs/`
- Per-phase plan files generated in the same invocation under `openspec/plans/`
- AL object inventory with ID allocation from `app.json` range and correct affix: tables, enums, pages, page extensions, codeunits, permission sets
- Table field definitions section
- Page layout notes section
- Integration points with standard BC (verified against Microsoft Learn before assuming reuse)
- Testable technical acceptance criteria mapped back to the user-story ACs
- Phase Overview with phased task breakdown
- `references/spec-template.md`: canonical SPEC-001 template structure
- `references/plan-template.md`: canonical per-phase plan template structure
- `references/spec-fields.json`: field map for downstream docx conversion
