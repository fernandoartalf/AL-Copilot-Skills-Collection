# Changelog

All notable changes to the BC Table Dimensions Generator skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-20

### Added
- Initial skill for adding standard dimension support to custom tables.
- Table fields (Shortcut Dimension 1/2 Code, Dimension Set ID) and core procedures.
- Card page Dimensions group with 8 shortcut dimensions and visibility driven by `DimMgt.UseShortcutDims` (Incident module pattern).
- Master data inheritance: Strategy A (standard merge via `CreateDimFromDefaultDim` / `GetRecDefaultDimID`, Penalty module) and Strategy B (single source with fallback via `GetDefaultDimID`, Incident module).
- List page columns, header-to-line inheritance and cascade (Work Worksheet module), archive/read-only pattern.
- Testing checklist.
