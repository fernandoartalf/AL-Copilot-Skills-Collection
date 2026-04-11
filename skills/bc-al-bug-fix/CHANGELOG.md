# Changelog

All notable changes to the `bc-al-bug-fix` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-09

### Added

- Initial skill creation
- Six-step fix workflow: triage → hypothesis → diagnosis doc → fix → regression test → Skills Evidencing
- Layer classification system: Data / Logic / UI / Integration / Security / Configuration
- Behaviour rules enforcing diagnosis-before-fix discipline
- `references/symptom-map.md`: BC-specific symptom → root cause catalogue with probability weights:
  - Wrong value on page (FlowField 0, regular field wrong, decimal calculation fails)
  - Record not found (Get false, FindSet empty)
  - Action / trigger not executing (event subscriber silent, OnValidate skipped, page action dead)
  - Posting failures (unexpected validation error, wrong ledger entry)
  - Permission errors (missing permission set entry, indirect permission not declared)
  - Performance symptoms (slow page load)
  - Data integrity issues (duplicates, orphan records)
- `references/fix-patterns.md`: 10 targeted fix patterns with before/after AL code:
  - FP-01: CalcFields not called
  - FP-02: SetLoadFields truncating data
  - FP-03: Event subscriber signature mismatch
  - FP-04: Direct assignment instead of Validate
  - FP-05: Missing IsHandled check in OnBefore event
  - FP-06: Modify(true) in bulk migration
  - FP-07: Missing indirect permission on codeunit
  - FP-08: CalcSums instead of loop accumulation
  - FP-09: FlowField in repeat..until loop
  - FP-10: OnBeforeDelete missing in tableextension
- Diagnosis document template with symptom, layer, hypotheses, confirmed root cause, proposed fix, and regression risk sections
- Pre-commit checklist covering fix minimality, SetLoadFields completeness, signature verification, and test coverage
