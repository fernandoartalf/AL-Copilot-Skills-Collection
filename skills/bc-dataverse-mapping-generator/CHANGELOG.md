# Changelog

All notable changes to this skill are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [2.1.0] - 2026-03-22 - @fernandoartalf

### Added
- Complete documentation of `IsNewTableMapping` local procedure in both reference files
- Duplicate prevention mechanism explanation with code implementation details
- Usage scenarios table showing when duplicate prevention matters
- Step-by-step guide for checking existing base app mappings in CDS Connection Setup

### Changed
- Enhanced `InsertIntegrationFieldMapping` parameter documentation to include duplicate prevention note
- Updated OOB entity reference with detailed duplicate protection section
- Clarified why duplicate prevention is especially critical for OOB entities

## [2.0.0] - 2026-03-22 - @fernandoartalf

### Added
- YAML frontmatter with name and description fields
- Decision matrix to differentiate Custom Entity vs OOB Entity paths
- Reference file `references/custom-entity-mapping.md` with complete custom entity code patterns
- Reference file `references/oob-entity-mapping.md` with OOB extra field mapping patterns
- Event subscriber summary table for both entity types
- Validation checklists for both paths
- Field mapping direction reference table
- CDS table extension guidance for OOB entities with custom Dataverse fields
- Duplicate mapping warnings for OOB path
- AUTHORS.md and CHANGELOG.md

### Changed
- Restructured SKILL.md to follow progressive disclosure pattern (lean body + reference files)
- Split monolithic instructions into two distinct workflow paths
- Moved detailed code examples into reference files

### Removed
- Inline code patterns from SKILL.md body (moved to references)

## [1.0.0] - 2026-03-20 - @fernandoartalf

### Added
- Initial skill release
- Custom entity mapping workflow
- Code patterns for all 5 event subscribers
- Lookup procedure pattern
- Department entity complete example
