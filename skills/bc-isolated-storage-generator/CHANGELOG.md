# Changelog

All notable changes to the `bc-isolated-storage-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-30 - @fernandoartalf

### Added

- `references/isolated-storage-examples.md` with 6 full working examples:
  - Basic standalone setup table with Module scope
  - Management codeunit for existing table integration (Company scope)
  - Setup page with masked input and clear action
  - Multiple secrets in a single table with shared helpers
  - User-scoped personal token storage
  - Integration with HttpClient consuming secrets at runtime
- Common anti-patterns section (6 patterns):
  - Storing secrets in table fields
  - Missing Contains() check before Get/Delete
  - Mixing DataScopes across operations
  - Using Access = Public on secret management objects
  - Hardcoding GUID in Text constants instead of Labels
  - Skipping encryption when available
- Best practices checklist (12 items)
- CHANGELOG.md for version history

### Changed

- Optimised SKILL.md frontmatter description for broader trigger phrase matching
- Improved encryption logic: prefer `SetEncrypted` directly, fall back to plain `Set`
- Clarified template substitution rules and naming convention table
- Added `OnValidate` empty-string handling in page template (deletes secret on clear)
- Strengthened validation step with 10-point checklist
- Added `SetEncrypted` character limit warning in security considerations
- Referenced examples file from SKILL.md for grounding

## [1.0.0] - 2026-04-15 - @fernandoartalf

### Added

- Initial SKILL.md with isolated storage generation patterns
- Five mandatory interview questions (purpose, DataScope, GUID key, existing table, page)
- DataScope reference table with use-case guidance
- IsolatedStorage methods reference table
- Setup table template with encryption support
- Management codeunit template for existing table integration
- Setup page template with masked field and clear action
- 7-step code generation workflow
- Hard rules for security (Access = Internal, Locked labels, Contains guard, encryption)
- Security considerations (ShowMyCode, 215-char limit, per-user scope implications)
- External references (Microsoft Learn, VLD-BC blog, GUID generator)
- AUTHORS.md for authorship tracking
