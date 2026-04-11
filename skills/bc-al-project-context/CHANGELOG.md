# Changelog

All notable changes to the `bc-al-project-context` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-09

### Added

- Initial skill creation combining two complementary context mechanisms:
  Architecture Decision Records (ADRs) and Session Handoff documents
- Five operating modes:
  - Mode 1: Create ADR (from decision description)
  - Mode 2: Query ADR (by topic or question)
  - Mode 3: Create Session Handoff (end of session)
  - Mode 4: Read Session Handoff (start of session — immediate next action first)
  - Mode 5: Generate Context Brief (onboarding a new developer or AI agent)
- File-based storage in `.github/decisions/` and `.github/context/` — version-controlled,
  no special tooling required
- ADR numbering convention: sequential from 001, kebab-case filenames
- ADR status lifecycle: Proposed → Accepted → Deprecated / Superseded
- Session Handoff structure: immediate next action, in progress, completed,
  open questions, decisions, context for next agent, files touched
- Behaviour rules enforcing: honesty in tradeoffs, status currency, action-first
  handoffs, ADR creation before session close for significant decisions
- `references/adr-format.md`: full ADR template, status value table, three
  complete BC AL examples (event subscribers decision, posting scope decision,
  superseded credentials decision), and writing tips
- `references/handoff-format.md`: full Handoff template, two complete BC AL
  examples (mid-sprint developer handoff, end-of-sprint AI agent handoff),
  and writing tips
