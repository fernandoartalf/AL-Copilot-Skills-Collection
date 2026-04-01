# Changelog

All notable changes to the `bc-number-series-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-22

### Changed

- Enhanced trigger behavior documentation to clarify distinction between table and table extension triggers
- Added OnBeforeDelete/OnDelete trigger documentation
- Specified when to use OnInsert vs OnBeforeInsert, OnRename vs OnBeforeRename based on object type

## [1.0.0] - 2026-03-22

### Added

- Initial skill creation
- Core number series pattern with setup table, table extension, and page extension
- Quick start templates for all required objects
- Three number series patterns: Simple, Multiple, and Related series
- NoSeries codeunit method reference table
- Trigger behavior documentation (OnBeforeInsert, OnBeforeRename)
- AssistEdit procedure implementation and UI integration
- Setup page initialization pattern
- Pre-flight implementation checklist
- Common variations: Conditional numbering, Multiple series per entity, Header-lines pattern
- External references to blog post, Microsoft Docs, and GitHub repository
- Progressive disclosure via `references/` directory structure
