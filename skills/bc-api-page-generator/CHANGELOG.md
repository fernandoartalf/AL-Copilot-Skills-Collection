# Changelog

All notable changes to the `bc-api-page-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-20

### Changed

- Refactored SKILL.md from ~850 lines to ~138 lines for faster loading
- Moved complete examples (simple page, header-lines) to `references/api-examples.md`
- Moved common patterns, performance, security, and tips to `references/api-patterns.md`
- Condensed description to under 1024 characters
- Removed "When to Create" section from body (covered by description trigger phrases)
- Removed footer metadata (superseded by this changelog)

### Added

- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
- Progressive disclosure via `references/` directory
- API properties summary table
- Condensed API Design Workflow (6 steps)

## [1.0.0] - 2026-01-19

### Added

- Initial skill creation
- Core API page structure with properties, layout, actions, and triggers
- Complete examples: Items API (simple), Sales Orders API (header-lines)
- Field naming conventions and mapping table
- API design workflow (6 steps)
- Performance considerations
- Security & permissions with permission set templates
- Common patterns (read-only, calculated fields, enum)
- Pre-flight checklist
- External references (Microsoft Docs, OData, OAuth)
