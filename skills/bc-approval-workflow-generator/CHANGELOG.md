# Changelog

All notable changes to the `bc-approval-workflow-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-31 - @fernandoartalf

### Added

- Initial SKILL.md with approval workflow generation patterns
- Five mandatory interview questions:
  - Target entity (custom or standard table)
  - Table type (custom vs extension)
  - Related sub-tables for lock-down on approval
  - Target pages (Card / List / Both)
  - Approver routing (Direct, First Qualified, Chain, Specific User)
- 9-step code generation workflow:
  - Read project metadata from `app.json`
  - Naming derivation rules with examples
  - Feature-based folder structure for both custom and extension scenarios
  - Approval Status enum generation (`Open`, `Pending Approval`, `Rejected`, `Approved`)
  - Table/TableExtension with deletion guard and status field
  - Approval Management codeunit with all integration event patterns
  - Workflow Setup codeunit for category/template/table-relation registration
  - Page/PageExtension with Send/Cancel actions, StyleExpr, sub-table locking
  - Post-generation summary with setup instructions
- Event subscriber reference table covering all standard BC workflow event hooks
- 8 hard rules (affix usage, enum values, Editable = false, Modify(true), etc.)
- AUTHORS.md for authorship tracking
- Reference templates:
  - `references/enum-template.md` — Approval Status enum
  - `references/custom-table-template.md` — Custom table with OnDelete guard
  - `references/table-extension-template.md` — TableExtension with OnBeforeDelete
  - `references/approval-mgmt-codeunit-template.md` — Full approval management codeunit
  - `references/workflow-setup-codeunit-template.md` — Workflow category/template setup
  - `references/custom-page-card-template.md` — Custom Card page with approval actions
  - `references/page-extension-card-template.md` — PageExtension with approval actions
