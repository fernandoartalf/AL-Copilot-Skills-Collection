# Changelog

All notable changes to the `bc-pricing-refactor` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-05-05 - @cperezsx

### Changed

- Removed the skill README to align the package structure with `bc-reports`
- Added `AUTHORS.md` and `CHANGELOG.md`
- Reworked the skill wording to be runtime-agnostic instead of tied to a single Base Application package
- Reframed migration guidance around symbol verification in the target runtime
- Replaced hard runtime-specific page and codeunit IDs in the quick reference with verification guidance
- Converted `custom-price-method.al` into a reusable scaffold instead of a version-bound pseudo-implementation
- Clarified that `price-calculation-test.al` is a scenario template that must be adapted to the target runtime

## [1.0.0] - 2026-05-05 - @cperezsx

### Added

- Initial skill creation for pricing refactoring guidance
- Legacy-to-new pricing model mapping
- Guidance for extending price calculation methods
- Guidance for extending price source types
- Migration guidance for custom fields
- UI refactoring guidance for the new pricing experience
- Validation checklist and common pitfalls
- Reference files and example templates