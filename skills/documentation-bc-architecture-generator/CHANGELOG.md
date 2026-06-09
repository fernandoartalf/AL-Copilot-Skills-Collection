# Changelog

All notable changes to the `documentation-bc-architecture-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Workflow enforcing spec validation and architectural driver tracing before document generation
- Output file written as `ARCH-NNN-<kebab-title>.architecture.md` under `openspec/architecture/`
- Frontmatter linking back to source spec, user story, and CCN documents
- Business and technical context section traced to user-story acceptance criteria
- Numbered Architecture Decision Records (ADR-N) with Context, Decision, Consequence, and Alternatives-rejected
- Logical component view supporting ASCII and mermaid diagrams
- Key runtime flows section
- Data architecture section: entity-relationship diagram, storage/ownership table, key-derivation table
- Cross-cutting concerns: security, reliability, performance, observability, localisation, RapidStart/portability, upgrade/migration
- Coexistence with legacy code section
- Known constraints and limitations section
- `references/architecture-template.md`: canonical ARCH-001 template structure
- `references/architecture-fields.json`: field map for downstream docx conversion
