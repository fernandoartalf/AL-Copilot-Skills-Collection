# Changelog

All notable changes to the `documentation-bc-analysis-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Four-mode workflow: spec validation → driver capture → document generation → GO/NO-GO recommendation
- Output file written as `ANALYSIS-NNN-<kebab-title>.analysis.md` under `openspec/analysis/`
- Frontmatter linking back to source spec, user story, and CCN documents
- Scope and impact section: objects added/modified, LoC estimate, ID range usage
- Three-scenario time estimate (Optimistic / Expected / Pessimistic) with contingency and calendar duration
- Cost estimate section at a stated EUR/h rate with explicit assumptions
- SWOT analysis (Strengths / Weaknesses / Opportunities / Threats)
- Numbered risk register (`R-NN` format) with Likelihood, Impact, and Mitigation per entry
- GO / NO-GO / CONDITIONAL-GO feasibility recommendation with non-blocking advisories
- Handoff statement back to the AL Architect
- `references/analysis-template.md`: canonical ANALYSIS-001 template structure
- `references/analysis-fields.json`: field map for downstream docx conversion
