# Changelog

All notable changes to the `documentation-bc-user-story-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Grouped interview workflow: role, business context, pain points, standard BC behaviour, acceptance criteria, out-of-scope items, and open questions
- Standard BC behaviour verification against Microsoft Learn before documenting current state
- Output file written as `US-NNN-kebab-title.userstory.md` under `openspec/user-stories/`
- Frontmatter fields: id, title, Version, status (draft on creation), module, ProductOwner, created_date, approved_date
- Approval gate: status starts as `draft`; approval is a human gate that must be set before downstream skills (spec generator) can consume the file
- `references/user-story-template.md`: canonical US-001 template structure
- `references/user-story-fields.json`: field map for downstream docx conversion
