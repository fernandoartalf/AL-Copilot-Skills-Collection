---
name: bc-al-code-reviewer
description: Reviews Business Central AL extension code against a prioritized convention stack: AppSource validation requirements, CodeCop/PerTenantExtensionCop analyzer rules, alguidelines.dev community standards, and al-copilot-skills catalogue patterns. Audits five categories that the AL compiler does not catch: naming and structure, performance anti-patterns, extensibility contract, SaaS readiness, and AppSource blockers. Produces a structured review report with severity-classified findings (🔴 Blocker / 🟡 Warning / 🔵 Suggestion) and a prioritized fix list. Use this skill whenever you want to review AL code before a PR, before AppSource submission, before deploying to a customer, when onboarding a new developer, when inheriting legacy AL code, or when a senior developer needs to audit an extension. Also trigger when the user says "review my code", "check this extension", "is this AppSource ready", "code quality", "AL best practices", or "what's wrong with this".
---

# BC AL Code Reviewer

Audits Business Central AL extension code against a prioritized convention stack and produces a structured review report. The compiler catches syntax errors — this skill catches the mistakes that compile fine but cause problems in production, AppSource rejection, or SaaS environments.

Read `references/convention-stack.md` **while running Categories 1–4** — it contains the complete rule set with AL code examples and source references for every check.
Read `references/appsource-blockers.md` **when running Category 5 or when the user asks about AppSource readiness** — it contains the 14 blockers with Microsoft documentation links and a pre-submission checklist.

---

## Convention priority stack

Rules are applied in this priority order. When sources conflict, the higher priority wins:

| Priority | Source | Scope |
|---|---|---|
| 1 | AppSource validation requirements | Blocks publication — non-negotiable |
| 2 | CodeCop / PerTenantExtensionCop analyzers | Compiler warnings treated as errors in CI |
| 3 | [alguidelines.dev](https://alguidelines.dev) | Community standard, widely adopted |
| 4 | al-copilot-skills catalogue patterns | Ecosystem-specific, this skill collection |

When a finding comes from Priority 1 or 2, it is always 🔴 Blocker regardless of how minor it looks.

---

## Input

The user provides one or more of:

- **AL code** — one or more `.al` files (table, page, codeunit, report, etc.)
- **Scope** — what to focus on: full review, AppSource readiness only, performance only, SaaS readiness only
- **Context** — is this for AppSource, a per-tenant extension, or an internal tool?
- **Extension type** — new extension or modification of an existing one

If no scope is specified, run a full review across all five categories.
If the user provides only a snippet (not a full object), note which checks cannot be run without the full object.

---

## Review categories

### Category 1 — Naming & Structure

Checks that objects, files, fields, and variables follow AL naming conventions.

Key rules — see `references/convention-stack.md#naming` for the complete list:
- All custom objects have a prefix or suffix (mandatory for AppSource)
- File naming matches object type (`MyCodeunit.Codeunit.al`, not `Codeunit50100.al`)
- Object IDs within the declared `app.json` `idRanges`
- No `WITH` statements (`NoImplicitWith` feature required from runtime 11.0+)
- Labels use `Locked = true` when translation is not intended
- `ObsoleteState` always paired with `ObsoleteReason` and `ObsoleteTag`
- Procedures use PascalCase, local variables use camelCase
- No hardcoded company names, environment names, or user IDs in code

---

### Category 2 — Performance Anti-Patterns

Checks for patterns that compile correctly but cause slow pages, timeouts, or database overload.

Key rules — see `references/convention-stack.md#performance`:
- `SetLoadFields` present before every `FindSet` / `FindFirst` / `Get` that reads specific fields
- No `CalcFields` inside `repeat...until` loops
- No database calls (`Get`, `FindSet`, `FindFirst`) inside `repeat...until` loops over large tables
- No `CalcSums` replaceable loops (manual sum accumulation)
- Maximum 4 FlowFields on List pages
- No `Commit` inside loops
- `SetRange` / `SetFilter` applied before `Find*` (never after)

---

### Category 3 — Extensibility Contract

Checks that the code respects the BC event-driven extensibility model so other extensions can integrate safely.

Key rules — see `references/convention-stack.md#extensibility`:
- Every business procedure has an `OnBefore` + `OnAfter` `[IntegrationEvent]` pair
- `OnBefore` events always include `var IsHandled: Boolean` parameter
- `IsHandled` is checked after raising the event (`if IsHandled then exit`)
- No `Commit` inside event subscribers
- Event subscriber parameters match publisher signature exactly (verified, not assumed)
- `[IntegrationEvent(false, false)]` used (not `GlobalVarAccess = true` unless justified)
- Publishers do not expose internal implementation details through event parameters
- `[BusinessEvent]` used for optional integrations, `[IntegrationEvent]` for critical ones

---

### Category 4 — SaaS Readiness

Checks for patterns that work on-prem but fail or are rejected in SaaS / Business Central online.

Key rules — see `references/convention-stack.md#saas`:
- `InherentPermissions` declared on all codeunits (`InherentPermissions = X` minimum)
- `InherentEntitlements` declared on all objects
- No `DataPerCompany = false` without explicit justification in a comment
- No direct file system access (`File`, `Blob` local paths)
- No `Shell` or OS-level calls
- No hardcoded absolute paths
- `[NonDebuggable]` on procedures handling secrets or credentials
- Secrets stored in `IsolatedStorage`, never in table fields as plain text
- No `sleep` or artificial delays
- `ExecutionContext` guard on event subscribers that call external services
- No `SMTP` direct — use `Email` module instead

---

### Category 5 — AppSource Blockers

Checks specifically for the conditions that cause AppSource validation to reject a submission.
See `references/appsource-blockers.md` for the complete list with references.

Key checks:
- Prefix/suffix registered and applied consistently to all objects and fields
- No access to base app internal procedures (those not marked `[Obsolete]` but not `public`)
- `application` dependency version compatible with target BC release
- `logo` and `brief` present in `app.json`
- No `suppressWarnings` pragma hiding CodeCop errors
- No `#pragma warning disable` without a specific rule number and justification comment
- `TranslationFile` feature enabled if the extension supports multiple languages
- No `ObsoleteState = Removed` objects still referenced in code
- Test coverage present (test app as separate project)

---

## Execution workflow

### Step 1 — Identify object types and scope

List every object type present in the provided code. Note which categories apply:

| Object type | Categories that apply |
|---|---|
| Table / TableExtension | 1, 2, 3, 4, 5 |
| Page / PageExtension | 1, 2, 4, 5 |
| Codeunit | 1, 2, 3, 4, 5 |
| Report | 1, 2, 4, 5 |
| Query | 1, 2, 4, 5 |
| Enum / EnumExtension | 1, 5 |
| PermissionSet | 1, 5 |
| Interface | 1 |

### Step 2 — Run each applicable category

For each category, list every rule violation found. Do not skip a rule because it seems minor — the severity classification handles prioritization.

### Step 3 — Classify findings

| Severity | Symbol | Criteria |
|---|---|---|
| Blocker | 🔴 | Priority 1 or 2 source, OR causes runtime failure in SaaS/AppSource |
| Warning | 🟡 | Priority 3 source, OR degrades performance/extensibility but does not block |
| Suggestion | 🔵 | Priority 4 source, OR style/readability improvement |

### Step 4 — Generate review report

Use the exact template below.

### Step 5 — Generate prioritized fix list

After the report, produce a numbered fix list ordered by: 🔴 first (by AppSource impact), then 🟡, then 🔵. Each item has the exact line or object to fix and the corrected version.

---

## Report template

```markdown
# AL Code Review Report

**Extension:** {extension name from app.json or "unnamed"}
**Date:** {today}
**Scope:** Full review / AppSource readiness / Performance / SaaS readiness
**Objects reviewed:** {list of object types and counts}

---

## Summary

| Category | 🔴 Blockers | 🟡 Warnings | 🔵 Suggestions |
|---|---|---|---|
| 1 — Naming & Structure | n | n | n |
| 2 — Performance | n | n | n |
| 3 — Extensibility | n | n | n |
| 4 — SaaS Readiness | n | n | n |
| 5 — AppSource Blockers | n | n | n |
| **Total** | **n** | **n** | **n** |

**AppSource ready:** Yes / No / Conditional (fix blockers first)

---

## Findings

### 🔴 Blockers — {count}

#### [B-01] {Short title}
- **Category:** {1–5}
- **Source:** AppSource / CodeCop / alguidelines.dev / al-copilot-skills
- **Location:** {Object name, line or section}
- **Rule:** {Rule reference or description}
- **Issue:** {What is wrong and why it matters}
- **Fix:** {Exact corrected code or instruction}

{Repeat for each blocker}

---

### 🟡 Warnings — {count}

#### [W-01] {Short title}
- **Category:** {1–5}
- **Source:** {source}
- **Location:** {location}
- **Issue:** {issue}
- **Fix:** {fix}

---

### 🔵 Suggestions — {count}

| ID | Category | Location | Issue | Suggestion |
|---|---|---|---|---|
| S-01 | {cat} | {loc} | {issue} | {suggestion} |

---

## Prioritized fix list

1. 🔴 [B-01] {one-line fix description} → {object/line}
2. 🔴 [B-02] ...
3. 🟡 [W-01] ...
4. 🔵 [S-01] ...

---

## Convention sources

- AppSource requirements: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-checklist-submission
- CodeCop rules: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/codecop
- alguidelines.dev: https://alguidelines.dev
- al-copilot-skills catalogue: https://github.com/microsoft/al-copilot-skills

---

## Skills Evidencing

| Field | Value |
|---|---|
| Skill loaded | bc-al-code-reviewer |
| Objects reviewed | {list} |
| Convention stack applied | AppSource → CodeCop → alguidelines.dev → al-copilot-skills |
| Findings | 🔴 {n} / 🟡 {n} / 🔵 {n} |
| AppSource ready | Yes / No / Conditional |
```

---

## Behaviour rules

1. Never invent rules. Every finding must reference a specific rule from the convention stack. If you are unsure, mark the finding as 🔵 Suggestion and cite the closest applicable source.

2. If the user provides a snippet without full object context, note explicitly which checks could not be run (e.g., cannot verify `InherentPermissions` without the full codeunit declaration).

3. Do not rewrite the entire code. The fix for each finding is targeted and minimal.

4. If the extension context is "internal tool" (not AppSource, not SaaS), downgrade Category 4 and 5 findings from Blocker to Warning where appropriate — and state this explicitly in the report header.

5. If no issues are found in a category, say so explicitly — do not omit the category from the report.

---

## Reference files

- `references/convention-stack.md` — Complete rule set for all five categories with source references
- `references/appsource-blockers.md` — AppSource validation requirements with Microsoft documentation links
