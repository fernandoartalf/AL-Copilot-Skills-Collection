# Changelog

All notable changes to the `bc-al-code-reviewer` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-09

### Added

- Initial skill creation
- Prioritized convention stack: AppSource (P1) → CodeCop/PerTenantExtensionCop (P2) → alguidelines.dev (P3) → al-copilot-skills catalogue (P4)
- Five review categories with severity classification (🔴 Blocker / 🟡 Warning / 🔵 Suggestion):
  - Category 1 — Naming & Structure (9 rules: NS-01 to NS-09)
  - Category 2 — Performance Anti-Patterns (7 rules: PF-01 to PF-07)
  - Category 3 — Extensibility Contract (5 rules: EX-01 to EX-05)
  - Category 4 — SaaS Readiness (6 rules: SR-01 to SR-06)
  - Category 5 — AppSource Blockers (summary + full detail in appsource-blockers.md)
- Structured review report template with per-category summary table, AppSource readiness verdict, prioritized fix list, and Skills Evidencing block
- Five-step execution workflow: scope identification → category runs → classification → report → prioritized fix list
- Behaviour rules: findings must reference a specific rule, no full rewrites, context-aware severity downgrade for internal tools
- `references/convention-stack.md`: complete rule set with AL code examples (before/after), source references, and Microsoft documentation links
- `references/appsource-blockers.md`: 14 AppSource blockers (AS-01 to AS-14) with Microsoft documentation links and a pre-submission quick validation checklist
