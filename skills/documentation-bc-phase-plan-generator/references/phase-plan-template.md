<!-- PLAN-DOC-BC-003 heading rules: H2s must NOT carry a manual numeric prefix (template auto-numbers) and MUST NOT end with a source-ID suffix like '(from US-NNN)'. H3 subsection labels keep the 'N.M ' prefix shape but translate the label text. See SKILL.md "Heading & full-content translation rules". -->
---
id: PLAN-NNN-P<N>
title: <Spec short title> — Phase <N> — <Phase Name>
version: 1.0.0
spec: SPEC-NNN
user_story: US-NNN
ccn: <CCN-NNN or empty>
phase: <N>
status: not-started
estimated_hours: <hours>
branch: feature/spec-NNN-<kebab-title>
depends_on:
  - PLAN-NNN-P<N-1>
assignee: <AL Developer or empty>
created_date: <YYYY-MM-DD>
approved_date:
related_docs:
  - openspec/specs/SPEC-NNN-<kebab-title>.spec.md
  - openspec/userstories/US-NNN-<kebab-title>.userstory.md
  # - docs/ccn/CCN-NNN-<kebab-title>.md
language: en
---

# Phase <N> — <Phase Name>

## References
<!-- section-key: References -->

- **User story**: [US-NNN](../userstories/US-NNN-<kebab-title>.userstory.md) — acceptance criteria <list of US-AC numbers satisfied by this phase>.
- **Spec**: [SPEC-NNN §<x.y> (<objects>), §<z> Phase <N>, §<w.v>](../specs/SPEC-NNN-<kebab-title>.spec.md)
- **CCN**: [CCN-NNN](../../docs/ccn/CCN-NNN-<kebab-title>.md) *(omit when no CCN exists)*
- **Acceptance criteria satisfied by this phase**: AC-…-NNN, AC-…-NNN, AC-…-NNN.

## Goal
<!-- section-key: Goal -->

<2–4 sentences describing the concrete, demoable outcome at the end of this phase. Must reference the objects or behaviors that did not exist before the phase started.>

## Branch
<!-- section-key: Branch -->

<For Phase 1: "Cut `feature/spec-NNN-<kebab-title>` from `main`."
For Phase > 1: "Continue on `feature/spec-NNN-<kebab-title>`.">

## Tasks
<!-- section-key: Tasks -->

- [ ] **<N>.1** <Action verb + specific object (ID, name) + key properties / fields from spec>. *(AC-…-NNN)*
- [ ] **<N>.2** <Action verb + specific object>. *(AC-…-NNN)*
- [ ] **<N>.3** <Action verb + specific object>. *(AC-…-NNN)*
- [ ] **<N>.4** <Modification to an existing object, citing the spec §>. Reference: SPEC-NNN §<x.y>.
- [ ] **<N>.5** Manual smoke test / RapidStart export / verification step in a sandbox: <concrete steps>. *(AC-…-NNN)*

## Exit criteria
<!-- section-key: ExitCriteria -->

- All tasks <N>.1 – <N>.M checked.
- AC-…-NNN, AC-…-NNN, AC-…-NNN demonstrably met.
- <Phase-specific verification, e.g. "RapidStart export/import verified by manual smoke test in task N.5">.
- Build green; tests green.
- `app.json` version bumped (patch increment).

## Out of scope for this phase
<!-- section-key: OutOfScope -->

- <Item> — deferred to Phase <M>.
- <Item> — deferred per US-NNN Out of Scope.
- <Item> — not part of this story.

## Dependencies
<!-- section-key: Dependencies -->

### Prerequisites

- **PLAN-NNN-P<N-1>** — <one-line summary of what the upstream phase delivers that this phase consumes>.
<!-- If no prerequisites: "None — this is the first phase." -->

### Downstream consumers

- **PLAN-NNN-P<N+1>** — <one-line summary of what the consumer needs from this phase>.
<!-- If no consumers: "None — this is the final phase." -->

## Testing notes
<!-- section-key: TestingNotes -->

- <Test codeunits added / extended in this phase>.
- <Mocked vs. live strategy>.
- <Live-tenant / external-system tests deferred to which later phase>.
- <Any manual smoke-test scripts and where they live>.

## Notes for the AL Developer
<!-- section-key: NotesForAlDeveloper -->

- <Caption / tooltip rules specific to objects in this phase>.
- <Lookup filters, read-only fields, default values pulled from the spec>.
- <Translation deferrals or NAB/XLIFF guidance>.
- <Performance caveats relevant to this phase only>.
- <Microsoft Learn verification gaps (mechanism + reason), if any>.
- <Anything the developer would otherwise have to dig out of the spec>.