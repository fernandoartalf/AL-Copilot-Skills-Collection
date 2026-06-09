# Changelog

All notable changes to the `documentation-bc-ccn-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Short interview to capture cost inclusion, time inclusion, estimate scenario, and target language (BCP-47)
- Multi-language support: all prose translated to the target language while structural layer (headings, frontmatter keys, field labels, diagram markers) remains in canonical English for byte-stable JSON extraction
- Output file written as `CCN-NNN-<kebab-title>.md` under `docs/ccn/` (English) or `docs/<lang>-ccn/` (other languages)
- Frontmatter linking back to source user story, spec, architecture, and analysis documents
- Fixed section order: Header, Business Context, Proposed Solution, Architecture, Feasibility, Time/Cost, Testing Setup, Testing Steps, Recommendation, Approvals
- DIAGRAM-mermaid marker blocks on every diagrammable section for downstream docx rendering
- Compatibility with `documentation-bc-md-to-docx-converter` Word template pipeline
- `references/ccn-template.md`: canonical CCN-001 template structure
- `references/ccn-fields.json`: field map for downstream docx conversion
