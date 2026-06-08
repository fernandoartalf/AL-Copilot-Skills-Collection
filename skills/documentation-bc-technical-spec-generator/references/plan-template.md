<!-- PLAN-DOC-BC-003 heading rules: H2s must NOT carry a manual numeric prefix (template auto-numbers) and MUST NOT end with a source-ID suffix like '(from US-NNN)'. H3 subsection labels keep the 'N.M ' prefix shape but translate the label text. See SKILL.md "Heading & full-content translation rules". -->
---
id: PLAN-NNN-P<N>
title: <Feature> — Phase <N> — <Phase Name>
version: 1.0.0
phase: <N>
spec: SPEC-NNN
status: draft
estimated_effort: <N-M dev days>
created_date: <YYYY-MM-DD>
approved_date: ""
language: en
---

# Phase <N> – <Phase Name>

## Objective
<One short paragraph describing what this phase delivers and why it is self-contained.>

## Tasks
| # | Task | Object(s) | Notes |
|---|------|-----------|-------|
| 1 | <task> | `<Affix> <Object Name>` (id <id>) — `src/<folder>/<File>.al` | <notes> |

## Acceptance Criteria (Phase <N> only)
- [ ] <AC bullet — references AC-TBL-001 from SPEC-NNN §7>
- [ ] <AC bullet>

## Dependencies
- <Other phase / external prerequisite>

## Testing Notes
- Test codeunit: `test/<feature>/<Feature>Phase<N>Tests.Codeunit.al`
- Manual smoke steps:
  1. <step>