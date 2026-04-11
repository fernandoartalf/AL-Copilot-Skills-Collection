# ADR Format — Architecture Decision Records

## What is an ADR

An Architecture Decision Record captures a significant technical decision: the context that made it necessary, the options considered, the decision made, and the consequences. It is written for a future reader — human or AI — who will encounter the code and wonder "why is it this way?".

ADRs are short. A good ADR fits on one screen. If it needs more, the decision probably needs to be split into two.

---

## Status values

| Status | Meaning |
|---|---|
| `Proposed` | Decision under discussion, not yet final |
| `Accepted` | Decision is in effect |
| `Deprecated` | Decision was valid, no longer applies (context changed) |
| `Superseded` | Decision replaced by a newer ADR — link to it |

---

## Template

```markdown
# ADR-{NNN} — {Short descriptive title}

**Date:** YYYY-MM-DD
**Status:** Proposed / Accepted / Deprecated / Superseded by ADR-{NNN}
**Deciders:** {names or roles — e.g., "Javier (architect), Roberto (developer)"}
**Extension:** {extension name from app.json}

---

## Context

{1–3 paragraphs. What situation made this decision necessary?
What constraints exist? What was the trigger?
Write for a reader who has no context — they should understand
why this decision needed to be made at all.}

## Decision

{1 paragraph. What was decided? State it directly.
"We will use X" or "We decided not to use Y because Z".
No hedging. No "we considered". Just the decision.}

## Alternatives considered

### Option A — {name}
{Brief description. Why was it rejected?}

### Option B — {name}
{Brief description. Why was it rejected?}

### Option C — {chosen option, for reference}
{Why this one won.}

## Consequences

**Positive:**
- {benefit}
- {benefit}

**Negative / tradeoffs:**
- {cost or constraint accepted}
- {cost or constraint accepted}

**Neutral / notes:**
- {things that follow from this decision that are neither good nor bad}

## Related

- ADR-{NNN}: {related decision}
- Issue #NNN: {related issue if any}
```

---

## Numbering convention

ADRs are numbered sequentially starting from 001. Never reuse a number. If an ADR is superseded, the old number stays — the new ADR gets the next number and references the old one.

File naming: `ADR-{NNN}-{kebab-case-title}.md`

Examples:
- `ADR-001-use-event-subscribers-not-base-modification.md`
- `ADR-002-posting-at-level-1-no-gl-entries.md`
- `ADR-003-separate-test-app-mandatory.md`

---

## Example 1 — Event subscriber vs base app modification

```markdown
# ADR-001 — Use event subscribers, never modify base app objects

**Date:** 2026-03-10
**Status:** Accepted
**Deciders:** Javier (architect)
**Extension:** CTX Lead Tracking v2

---

## Context

During the design of the lead conversion flow, the team identified that the standard
`Sales-Post` codeunit needed to be aware of lead status when posting a sales order
created from a converted lead. Two approaches were viable: modifying the base app
codeunit directly, or using the published `OnAfterPostSalesDoc` event.

The project targets SaaS (BC Online) and eventual AppSource submission.

## Decision

We will always use published IntegrationEvents and BusinessEvents to extend base app
behaviour. We will never modify base app objects directly. If a needed event does not
exist, we will raise a GitHub issue on BCApps requesting it and find a workaround
in the interim.

## Alternatives considered

### Option A — Modify Sales-Post codeunit directly
Simple, direct. Rejected: not possible in SaaS, breaks on BC updates, blocks AppSource
submission, causes merge conflicts when base app is updated.

### Option B — Event subscriber on OnAfterPostSalesDoc (chosen)
Requires the event to exist (it does). Decoupled from base app internals. Survives BC
updates. Compatible with SaaS and AppSource.

### Option C — Use a separate job queue entry triggered post-posting
Decoupled but asynchronous — lead status update would lag behind posting. Unacceptable
for the UX requirement of immediate status change.

## Consequences

**Positive:**
- Extension survives BC base app updates without modification
- AppSource submission unblocked
- Other ISVs can subscribe to our own events without touching our code

**Negative / tradeoffs:**
- Dependent on Microsoft publishing the right events — if an event is missing we are
  blocked until BCApps accepts the request (typically 1–2 sprints)
- Slightly more code than direct modification for simple cases

**Neutral / notes:**
- All new codeunits that expose business logic must publish their own OnBefore/OnAfter
  events following the same pattern (see skill-events)

## Related

- ADR-002: Event publisher pattern for our own codeunits
```

---

## Example 2 — Posting routine scope

```markdown
# ADR-002 — Posting routine limited to Level 1 (no direct G/L entries)

**Date:** 2026-03-12
**Status:** Accepted
**Deciders:** Javier (architect), Roberto (developer)
**Extension:** CTX Lead Tracking v2

---

## Context

The lead conversion process creates a customer and optionally a sales quote.
The team debated whether the posting routine for custom lead ledger entries
should write directly to G/L (Level 2) or only to custom ledger entries (Level 1).

The customer is a mid-size manufacturing company. Their BC consultant warned that
direct G/L posting from a custom extension requires deep integration with their
chart of accounts, posting groups, and VAT setup — which varies per company.

## Decision

The posting routine writes only to custom ledger entries (CTX Lead Entry table).
It does not create G/L entries directly. If G/L impact is needed in the future,
it will be handled via a separate posting group configuration connected to the
standard Sales posting flow — not via direct G/L writes from our extension.

## Alternatives considered

### Option A — Direct G/L posting (Level 2)
Full financial integration. Rejected: requires posting group configuration per
company, VAT handling, reconciliation logic — scope doubles. Can be added in v3
if the customer requests it with full UAT.

### Option B — Custom ledger entries only, no G/L (chosen)
Simpler, faster to deliver, lower risk. Financial reporting via custom reports
reading CTX Lead Entry. G/L impact tracked externally by the customer's accountant.

### Option C — No ledger entries at all, just status fields on the lead
Minimal. Rejected: loses audit trail. Customer explicitly required a full entry
history for regulatory purposes.

## Consequences

**Positive:**
- Posting routine is isolated from G/L complexity
- No posting group configuration required at go-live
- Lower risk of financial data corruption

**Negative / tradeoffs:**
- CTX Lead Entry is not reconcilable with G/L automatically
- Future G/L integration (if requested) requires a new posting routine — not additive

**Neutral / notes:**
- CTX Lead Entry table must expose an API page for DELFOS integration
  (see extension-manifest skill for DELFOS consumption)

## Related

- ADR-001: Event subscriber approach
- ADR-003: Test coverage requirements
```

---

## Example 3 — Superseded ADR

```markdown
# ADR-003 — Store API credentials in setup table field

**Date:** 2026-02-01
**Status:** Superseded by ADR-007
**Deciders:** Javier
**Extension:** CTX Lead Tracking v1

---

## Context

The extension integrates with an external CRM via REST API requiring an API key.
In v1, the key was stored in a Text[250] field on the setup table for simplicity.

## Decision

Store the API key in a Text[250] field on CTX Setup, encrypted at rest by BC.

## Consequences

**Negative (discovered post-implementation):**
- BC does not encrypt table fields at rest in all environments
- AppSource validation flagged this as a security issue during submission review
- Plain text credentials visible to any user with read access to the setup table

## Related

- ADR-007: Migrate API credentials to IsolatedStorage (supersedes this)
```

---

## Tips for writing good ADRs

**Write the Context first.** If you cannot explain the context clearly, the decision probably is not ready to be made yet.

**State the decision in one sentence.** If it takes a paragraph, it's two decisions.

**Include rejected alternatives.** The alternatives are often more valuable than the decision itself — they explain the boundaries of the solution space.

**Be honest about tradeoffs.** An ADR that has no negative consequences is not trustworthy. Every non-trivial decision has a cost.

**Keep them short.** A 500-line ADR will not be read. A 50-line ADR will.

**Update the status.** A superseded ADR with status `Accepted` is actively misleading. Update it.
