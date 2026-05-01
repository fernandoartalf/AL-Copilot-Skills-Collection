# Changelog

All notable changes to the `bc-reports` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-30

### Added

- Initial skill creation
- AL report object structure with DataItem hierarchy and DataItemLink
- Request page standards with SaveValues, Caption, and ToolTip requirements
- Report trigger guide (OnPreReport, OnPostReport, OnAfterGetRecord, OnPreDataItem)
- Rendering block conventions with layout file path standards
- RDLC PageHeader/PageFooter height sizing formula and worked example
- SetData/GetData index management rules — append-only pattern to prevent index corruption
- GetData index map documentation convention using XML comment blocks
- Body width validation with reference table for A4 Portrait, A4 Landscape, and Letter Portrait
- Proportional column reduction formula for overflow resolution
- Overflow warning message template
- Rendering mode guidelines (RDLC, Word, Excel) with usage criteria
- RDLC best practices checklist covering AL object and layout layers
- Reference files:
  - `references/rdlc-sizing-reference.md` — unit conversions, measurements, and proportional reduction example
  - `references/setdata-index-guide.md` — step-by-step index management with verification checklist
  - `references/al-report-checklist.md` — pre-commit checklist for AL object and RDLC changes
