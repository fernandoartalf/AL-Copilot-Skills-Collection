# Changelog

All notable changes to this skill are documented here.

## [1.0.0] - 2026-05-01

### Added
- Initial release of `bc-field-segregation` skill
- Pattern A: TransferFields — zero-code propagation for Sales, Purchase, Transfer posting chains
- Pattern B: EventSubscriber — dedicated codeunit per module for ledger and other posting chains
- `references/pattern-a-table-map.md` — full source→target map for TransferFields chains
- `references/pattern-b-event-map.md` — event catalog for all major BC posting codeunits
- `references/field-segregation-checklist.md` — pre-commit checklist for both patterns
- Decision tree for pattern selection
- Anti-pattern detection: redundant subscriber when TransferFields already covers the field
- 7 implementation rules and 7 behaviour rules
- Known limitations: Modify(false), multiple inserts per posting, FlowField exclusion
