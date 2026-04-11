---
name: bc-al-bug-fix
description: Diagnoses and fixes bugs in Business Central AL extensions following a structured investigation workflow. Covers the full fix cycle: symptom triage, root cause identification, minimal targeted fix, and regression test. Maps BC-specific symptoms to their most likely root causes before touching code — including FlowField miscalculation, SetLoadFields data truncation, event subscriber ordering, trigger execution gaps, permission errors, and posting validation failures. Generates a diagnosis document before any code change. Use this skill whenever you need to debug AL code, fix a BC extension bug, investigate unexpected behaviour, resolve a runtime error, troubleshoot a posting failure, investigate a wrong value on a page, or fix a broken event subscriber. Also use when the user says "this is not working", "wrong value", "record not found", "not triggered", "permission error", or any AL/BC runtime complaint.
---

# BC AL Bug Fix

Structured diagnosis and fix workflow for Business Central AL extension bugs. The core principle: **understand before touching**. Every fix starts with a diagnosis document, not with code changes.

Read `references/symptom-map.md` **during Step 1 triage** to map the symptom to its most likely root causes before touching any code.
Read `references/fix-patterns.md` **after confirming the root cause** to apply the correct fix pattern and use the diagnosis template.

---

## What makes BC bugs different

BC AL bugs rarely have an obvious stack trace. The same surface symptom — "wrong value on the page", "record not found", "action does nothing" — can come from a dozen different root causes spread across tables, page extensions, event subscribers, permissions, and configuration. Jumping to a code fix without diagnosis almost always fixes the wrong thing.

This skill imposes a discipline: **map the symptom to the layer first**, then look at code.

---

## Input

The user provides one or more of:

- **Symptom description** — what the user sees, on which page, after which action
- **Error message** — exact text if any error is shown
- **AL code** — the relevant codeunit, table, page, or extension
- **Object type** — is this a table extension, a page extension, an event subscriber, a report?
- **BC version / environment** — SaaS, On-Prem, version number (affects available APIs)

If the user provides code without a symptom, ask for the symptom first. Root cause analysis without observable behaviour is guesswork.

---

## Execution workflow

### Step 1 — Triage: layer and category

Before reading a single line of code, classify the bug:

**Layer** (where does it live?):

| Layer | Examples |
|---|---|
| Data | Wrong field value, missing record, duplicated entry |
| Logic | Calculation wrong, condition not met, loop skips records |
| UI | Field not visible, action disabled, page not refreshing |
| Integration | Event subscriber not firing, posting fails at wrong point |
| Security | Permission error, data scope wrong, company filter leaking |
| Configuration | Setup missing, number series not configured, posting group absent |

**Category** (what kind of bug?): see `references/symptom-map.md` for the full catalogue with root cause probabilities per symptom.

State the layer and category explicitly before proceeding.

---

### Step 2 — Hypothesis: most likely root causes

Based on the symptom and layer, list the top 2–3 most likely root causes in priority order. Do not list more than 3 — if you cannot narrow it down, ask a clarifying question.

Example format:

```
Symptom: Balance field shows 0 on Customer Card after posting.
Layer: Data / UI
Most likely causes:
  1. CalcFields not called — FlowField not refreshed after posting (HIGH probability)
  2. SetLoadFields excludes Balance (LCY) — field present but not loaded (MEDIUM)
  3. Wrong key used in CalcFormula filter — field calculated against wrong records (LOW)
```

---

### Step 3 — Diagnosis document

**Always create this before writing any fix.** File: `{object-name}-diagnosis.md`

Use the exact template in `references/fix-patterns.md#diagnosis-template`.

The diagnosis document must include:
- Symptom (as reported)
- Layer and category
- Hypotheses ranked by probability
- Evidence gathered (code snippets, trigger order, field values)
- Confirmed root cause
- Proposed fix (description, not code yet)
- Regression risk — what else could break

**PAUSE here.** Present the diagnosis to the user and confirm before writing any code.

---

### Step 4 — Fix

Apply the minimal fix that addresses the confirmed root cause. Do not refactor, do not clean up unrelated code, do not add features. One fix, one commit.

Follow the fix pattern for the confirmed root cause category from `references/fix-patterns.md`.

Rules:
- `Modify(false)` for bulk data fixes — never fire triggers on migration fixes
- `SetLoadFields` before any `FindSet` if not already present
- Preserve existing event subscriber signatures exactly — changing a parameter type breaks all subscribers silently
- Never remove `IsHandled` from an OnBefore event — other subscribers may depend on it

---

### Step 5 — Regression test

For every fix, define at minimum:

- **Happy path test**: the scenario that was broken now works
- **Adjacent test**: the nearest scenario that should NOT have changed, confirm it still works
- **Edge case**: the boundary condition most likely to be affected by the fix

Write the test as a Given/When/Then description. If the project has a test codeunit, implement it. If not, document it for manual verification.

---

### Step 6 — Skills Evidencing

End every fix session with:

```
## Skills Evidencing
| Field | Value |
|---|---|
| Skill loaded | bc-al-bug-fix |
| Symptom | {symptom} |
| Layer | {layer} |
| Root cause | {root cause category} |
| Fix applied | {one-line description} |
| Diagnosis doc | {filename} |
| Tests defined | {count} |
```

---

## Behaviour rules

1. Never propose a fix without a diagnosis document. If the user pushes for a quick fix, explain the risk and offer to write the diagnosis in 2 minutes.

2. If the symptom is ambiguous (multiple equally likely root causes), ask one clarifying question before proceeding — not multiple questions at once.

3. If the bug is in a base BC object, the fix goes in a table/page/codeunit extension or an event subscriber — never in a base object.

4. If the root cause is configuration (missing setup, number series, posting group), say so and do not propose a code fix. Configuration bugs are not code bugs.

5. If you cannot reproduce the root cause from the provided information, say so. Do not fabricate evidence.

6. If the fix requires a data migration (existing records have wrong values), flag it explicitly and treat it as a separate step with its own diagnosis.

---

## Reference files

- `references/symptom-map.md` — BC symptom → root cause catalogue with probability weights
- `references/fix-patterns.md` — Fix patterns per root cause category + diagnosis template
