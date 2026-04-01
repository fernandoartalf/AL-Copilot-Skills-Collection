# Changelog

All notable changes to the `bc-api-query-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-29

### Changed

- Expanded SqlJoinType section from 3-row table to comprehensive property documentation
- Added missing join types: `RightOuterJoin` and `FullOuterJoin`
- Added detailed descriptions and "When to Use" guidance for all 5 join types
- Added remarks about DataItemLink interaction and default behavior
- Added ASCII visual diagrams showing join result sets
- Added external links: SqlJoinType Property reference, Linking and Joining Data Items guide

## [1.0.0] - 2026-03-29

### Added

- Initial SKILL.md with API query generation patterns
- Single-table and multi-table join dataitem patterns
- Aggregation method documentation (Sum, Count, Average, Min, Max)
- SqlJoinType reference (InnerJoin, LeftOuterJoin, CrossJoin)
- DataItemLink and DataItemTableFilter patterns
- Filter element documentation for OData query parameters
- Column naming conventions for API queries
- API query design workflow (8 steps)
- Generation checklist
- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
- `references/query-examples.md` with 5 full working examples:
  - Single table (Statistical Ledger Entry)
  - Multi-table join with aggregation (Customer Sales)
  - Item inventory with location grouping
  - Three-table join (Sales Summary)
  - G/L Entry analysis with dimensions
- Common patterns: Locked captions, multi-version API, composite DataItemLink, DataItemTableFilter, dimension columns
