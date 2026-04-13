---
name: bc-agent-instructions-debugger
description: Audits and diagnoses Business Central agent instruction files (InstructionsV1.txt or InstructionsV2.txt) to identify why an agent is not behaving as expected, and produces a structured diagnosis report plus a corrected version of the instructions. Covers pre-publication review (catch issues before deploying) and post-deployment debugging (diagnose a live agent that is failing). Analyzes instruction files against the BC agent runtime keyword contract, the Responsibilities-Guidelines-Instructions framework, and known anti-patterns. Generates severity-classified findings (🔴 blocking / 🟡 degradation / 🔵 improvement) with root cause explanation and minimal targeted fixes. Use whenever an agent produces unexpected output, loses context between pages, ignores a guideline, fails to invoke an action, gets stuck in a loop, or when you want to review instructions before publishing an agent for the first time.
---

# BC Agent Instructions Debugger

Audits Business Central agent instruction files to explain why an agent misbehaves and how to fix it — both before first publication and after a live failure.

## What this skill does

Given an instruction file (`InstructionsV1.txt` / `InstructionsV2.txt`) and an optional symptom description, this skill:

1. **Parses** the three-part RGI framework (Responsibility → Guidelines → Instructions)
2. **Simulates** the agent runtime's execution path step by step in natural language
3. **Classifies** every finding by severity and maps it to its root cause
4. **Produces** a structured diagnosis report (markdown)
5. **Produces** a corrected instruction file with targeted, minimal changes

Read `references/anti-patterns.md` for the complete catalogue of known failure modes and their signatures. Read `references/runtime-model.md` for the BC agent runtime mental model used during simulation.

---

## Input

The user provides one or more of:

- The instruction file content (pasted or as an uploaded `.txt`)
- A symptom description: what the agent does wrong, on which page, after which action
- The agent's profile page list (optional but improves diagnosis accuracy)
- Recent task timeline entries (optional, highest diagnostic value)

If the user provides only the instruction file with no symptom, run a **pre-publication audit** (full static analysis). If the user describes a symptom, run a **targeted debug** (symptom-first, then full static analysis).

---

## Execution workflow

### Step 1 — Parse and structure

Extract the three RGI sections. If any section is missing or malformed, flag it immediately as a 🔴 structural finding before proceeding.

Identify all:
- Keyword usages (`Navigate to`, `Set field`, `**Memorize**`, `**Reply**`, `Invoke action`, etc.)
- Guideline count and pattern (`ALWAYS` / `DO NOT`)
- Task sections (`## Task:`)
- Error handling sections

### Step 2 — Simulate execution (per task)

For each `## Task:` section, walk through the steps as the BC agent runtime would:

- Which page does the agent start on?
- Which fields/values are READ before being used elsewhere?
- Where is **Memorize** placed relative to where the value is needed?
- Are page names, field names, and action names stated exactly as they would appear in the agent's profile?
- Where could the agent get stuck, lose context, or produce wrong output?

Be explicit: "At step 3b, the agent reads `Credit Limit (LCY)` but this value is never **Memorized** before navigating away at step 4. When the agent reaches step 6, the value is gone."

### Step 3 — Classify findings

Assign every finding a severity:

| Severity | Symbol | Meaning |
|---|---|---|
| Blocking | 🔴 | Agent cannot complete the task or will loop/crash |
| Degradation | 🟡 | Agent completes the task but with wrong output, missing data, or unsafe behaviour |
| Improvement | 🔵 | Agent works but style, safety, or performance could be better |

Map each finding to one of the root cause categories in `references/anti-patterns.md`.

### Step 4 — Generate diagnosis report

Use the exact report template below. Do not add extra sections or reorder.

### Step 5 — Generate corrected instructions

Produce a corrected version of the full instruction file. Apply only the fixes needed for 🔴 and 🟡 findings. Mark every changed line with an inline comment:

```
   a. Read "Credit Limit (LCY)" field          ← unchanged
   b. **Memorize**: "Limit: {Credit Limit (LCY)}"  ← FIXED: moved Memorize here, was missing
```

For 🔵 findings, list them in the report but do not apply them automatically — ask the user whether to include them.

---

## Report template

```markdown
# BC Agent Instructions — Diagnosis Report

**Agent:** {agent name or "unnamed"}
**Date:** {today}
**Mode:** Pre-publication audit | Targeted debug
**Symptom reported:** {symptom or "none — full static audit"}

---

## Executive summary

{2–4 sentences. What is the most likely root cause of the reported symptom?
What is the overall quality of the instruction file?}

---

## Findings

### 🔴 Blocking — {count}

#### [B-01] {Short title}
- **Location:** {Section / Step number}
- **Root cause category:** {from anti-patterns catalogue}
- **What happens:** {What the runtime does and why it fails}
- **Fix:** {Exact corrected text or instruction}

{Repeat for each blocking finding}

---

### 🟡 Degradation — {count}

#### [D-01] {Short title}
- **Location:** {Section / Step number}
- **Root cause category:** {from anti-patterns catalogue}
- **What happens:** {What the runtime does and why it produces wrong output}
- **Fix:** {Exact corrected text or instruction}

{Repeat for each degradation finding}

---

### 🔵 Improvement — {count}

| ID | Location | Issue | Recommendation |
|----|----------|-------|----------------|
| I-01 | {location} | {issue} | {recommendation} |

---

## Execution simulation

{Step-by-step walk of the first failing task. Narrate what the runtime does at each step
and where it goes wrong. Be concrete: quote the instruction text, name the page, name the field.}

---

## Skills Evidencing

| Field | Value |
|---|---|
| Skill loaded | bc-agent-instructions-debugger |
| Input | {file name or "pasted content"}, {symptom or "none"} |
| Mode | Pre-publication audit / Targeted debug |
| Findings | 🔴 {n} / 🟡 {n} / 🔵 {n} |
| Corrected file generated | Yes / No |
```

---

## Output files

| File | Content |
|---|---|
| `{agent-name}-diagnosis.md` | Full diagnosis report |
| `{agent-name}-fixed.txt` | Corrected instruction file |

If the agent has no name, use `agent-diagnosis.md` and `agent-fixed.txt`.

---

## Behaviour rules

1. Never guess page names, field names, or action captions — only reference what appears in the instruction file or what the user explicitly confirms exists in the agent's profile. Flag any unverifiable reference as a finding.

2. The corrected file must preserve the user's intent and writing style. Fix only what is broken; do not rewrite the entire file.

3. If the symptom the user describes does not match any finding in the static analysis, say so explicitly and ask for the task timeline entries — they are the highest-signal diagnostic source.

4. If the instruction file has no `## Task:` sections, flag it as 🔴 structural and do not proceed with simulation until the user confirms the format is intentional.

5. Produce the diagnosis report first. Ask the user to confirm before producing the corrected file, unless they explicitly asked for both upfront.

---

## Reference files

- `references/anti-patterns.md` — Full catalogue of known failure modes, their signatures, and standard fixes
- `references/runtime-model.md` — Mental model of the BC agent runtime: state retention, keyword contract, page navigation constraints
