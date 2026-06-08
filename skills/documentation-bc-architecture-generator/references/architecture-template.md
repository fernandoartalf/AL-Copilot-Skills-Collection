<!-- PLAN-DOC-BC-003 heading rules: H2s must NOT carry a manual numeric prefix (template auto-numbers) and MUST NOT end with a source-ID suffix like '(from US-NNN)'. H3 subsection labels keep the 'N.M ' prefix shape but translate the label text. See SKILL.md "Heading & full-content translation rules". -->
---
id: ARCH-NNN
title: Architecture — <Title>
spec: SPEC-NNN
user_story: US-NNN
ccn: <CCN-NNN or empty>
status: draft
version: 1.0
created_date: <YYYY-MM-DD>
author: AL Architect
related_docs:
  - openspec/specs/SPEC-NNN-<kebab-title>.spec.md
  - openspec/userstories/US-NNN-<kebab-title>.userstory.md
template: 4_Architecture_Template.docx
language: en
---

# ARCH-NNN — <Title>

> Architecture document for [SPEC-NNN](../specs/SPEC-NNN-<kebab-title>.spec.md). Describes the high-level structure, key design decisions, and cross-cutting concerns of <one-line summary>. This document is the long-lived companion to the spec: the spec describes **what** to build, this document explains **why** it is built that way.

---

## Context
<!-- section-key: Context -->

### 1.1 Business context

<2–4 paragraphs describing the originating business need. Reference [US-NNN](../userstories/US-NNN-<kebab-title>.userstory.md) for the full story.>

### 1.2 Technical context

<2–4 paragraphs describing the relevant pre-existing technical landscape: existing objects, codeunits, tables, integration points, and where the gap is.>

### 1.3 Scope of this architecture

In scope:

- <item>

Out of scope (deferred to future stories):

- <item>

---

## Architectural drivers
<!-- section-key: ArchitecturalDrivers -->

| # | Driver | Source | Implication |
|---|--------|--------|-------------|
| D-1 | <driver> | US-NNN AC-N | <implication> |
| D-2 | <driver> | SPEC-NNN §X | <implication> |
| D-3 | <driver> | CCN-NNN §X | <implication> |

---

## Architectural style and key decisions
<!-- section-key: ArchitecturalStyleAndDecisions -->

<1 short paragraph naming the chosen architectural style (e.g. "facade + data-driven adapter", "event-driven extension", "page-extension family") and stating which component owns which concern.>

### ADR-1 — <short title>

- **Context**: <which driver(s) force the decision>
- **Decision**: <what is chosen>
- **Consequence**: <observable consequence on the runtime / data / DX>
- **Alternatives rejected**: <option A> (<why>), <option B> (<why>)

### ADR-2 — <short title>

- **Context**: <…>
- **Decision**: <…>
- **Consequence**: <…>
- **Alternatives rejected**: <…>

### ADR-3 — <short title>

- **Context**: <…>
- **Decision**: <…>
- **Consequence**: <…>
- **Alternatives rejected**: <…>

---

## Logical component view
<!-- section-key: LogicalComponentView -->

```
   ┌─────────────────────────────────────┐
   │  <Host / entry point>               │
   └──────────────┬──────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────┐
   │  <Facade / orchestrator>            │
   └──┬─────────────────────────────┬───┘
      │ reads                        │ delegates
      ▼                              ▼
   ┌──────────────────┐    ┌──────────────────────────┐
   │ <Config tables>  │    │ <Existing plumbing>      │
   └──────────────────┘    │ (UNCHANGED)              │
                           └──────────────────────────┘
```

### 4.1 Component responsibilities

| Component | Responsibility | Does NOT do |
|-----------|----------------|-------------|
| <Component> | <responsibility> | <non-responsibility> |

---

## Key runtime flows
<!-- section-key: KeyRuntimeFlows -->

### 5.1 <Primary happy path>

```
<actor / event>
    │
    ▼
<step 1>
    │
    └─► <step 2>
            │
            ├─► <substep>
            └─► <substep>
    │
    ▼
<final observable state>
```

### 5.2 <Optimised / cached path, if applicable>

```
<actor / event>
    │
    ▼
<short-circuit step>
```

### 5.3 <Configuration / state change path, if applicable>

```
<actor / event>
    │
    ▼
<…>
```

### 5.4 <No-match / silent-disable / error path, if applicable>

```
<actor / event>
    │
    ▼
<silent exit>
```

---

## Data architecture
<!-- section-key: DataArchitecture -->

### 6.1 Entity-relationship overview

```
<ASCII or mermaid erDiagram showing the new tables, their PKs, and relationships
to existing standard / legacy tables>
```

### 6.2 Storage and ownership

| Object | Storage class | Owner | Lifecycle |
|--------|---------------|-------|-----------|
| <table> | `CustomerContent` | <Admin / Runtime> | <when created, when refreshed, when deleted> |

### 6.3 Key derivation

- **<Table> PK** = `(<fields>)`. <Rationale.>
- **<Table> PK** = `(<fields>)`. <Rationale.>

---

## Cross-cutting concerns
<!-- section-key: CrossCuttingConcerns -->

### 7.1 Security

- <permission set name + scope>
- <auth / token flow note, or "no change">

### 7.2 Reliability and error handling

- <try-pattern usage, silent-vs-loud failure policy, background-task error handling>

### 7.3 Performance

- Per-record cost on <happy path>: <O(...) + concrete count of DB / HTTP calls>
- Per-record cost on <cache-miss path>: <…>
- <bulk / iteration notes>

### 7.4 Observability

- <telemetry surface used or "out of scope for this story">

### 7.5 Localisation and translations

- <caption translation policy, placeholder binding rules>

### 7.6 RapidStart and portability

- <which tables round-trip, which are excluded, why>

### 7.7 Upgrade and migration

- <upgrade codeunits required or not; lazy populate vs migration codeunit>

---

## Coexistence with legacy <area>
<!-- section-key: CoexistenceWithLegacy -->

<Only include this section when legacy code exists in the area. Explicitly list which legacy objects remain unchanged and which (if any) are touched, with the nature of each touch. Reference the ADRs that enforce the coexistence guarantee.>

---

## Constraints and known limitations
<!-- section-key: ConstraintsAndLimitations -->

| # | Constraint / limitation | Source | Mitigation |
|---|-------------------------|--------|------------|
| C-1 | <limitation> | ADR-N / D-N | <mitigation or "documented in user docs"> |
| C-2 | <limitation> | <source> | <mitigation> |