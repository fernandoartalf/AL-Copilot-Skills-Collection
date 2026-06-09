# Changelog

All notable changes to the `documentation-bc-release-note-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Output file written as a markdown release note under `docs/releasenotesmd/`
- Sibling `*.releasenote.json` field map generated alongside every release note for downstream docx conversion
- Frontmatter fields: id, title, version, status, clientName, ccnNumber, issueNumber, releaseDate, releasedBy, module, createdDate, approvedDate
- Fixed section structure: Release Summary, Scope of Change, Change Request Details, Testing Setup, Testing Steps, Known Limitations, Approvals
- No hardcoded company, client, or publisher values — all identity fields extracted from `app.json` or prompted from the user
- Compatibility with `documentation-bc-md-to-docx-converter` release note Word template
- `references/release-note-template.md`: canonical release note template structure
- `references/release-note-fields.json`: field map for downstream docx conversion
