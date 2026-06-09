# Changelog

All notable changes to the `documentation-bc-phase-plan-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Spec validation gate: plan files are only generated from approved specs (`status: approved`)
- Full backlog generation in a single invocation: one `.plan.md` file per phase listed in the spec's Phase Overview
- Output files written as `SPEC-NNN-phase-<N>-<phase-name>.plan.md` under `openspec/plans/`
- Frontmatter per file: id, title, version, spec, user_story, ccn, phase, status, estimated_hours, branch, depends_on, related_docs, assignee, created_date, approved_date
- Mandatory body sections per file: References, Goal, Branch, Tasks (checkbox list with AC traceability), Exit criteria, Out of scope for this phase, Notes for the AL Developer, Dependencies, Testing notes
- Dependency graph step to wire phase-to-phase prerequisites before writing files
- `references/phase-plan-template.md`: canonical PLAN-PHASE template structure
- `references/phase-plan-fields.json`: field map for downstream docx conversion
