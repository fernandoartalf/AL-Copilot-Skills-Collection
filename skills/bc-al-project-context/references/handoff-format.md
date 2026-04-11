# Session Handoff Format

## What is a Session Handoff

A Session Handoff is a snapshot of the project state at the end of a work session. Its primary reader is the next person — or AI agent — who picks up the work. It is written for action, not for record-keeping.

The most important field is always **Immediate next action**. Everything else is context for that action.

---

## Template

```markdown
# Session Handoff — {YYYY-MM-DD}

**Extension:** {extension name}
**Session duration:** {approximate — e.g., "3 hours"}
**Developer / Agent:** {name or role}
**BC version / environment:** {e.g., "BC 25 SaaS sandbox"}

---

## Immediate next action

{ONE sentence. What is the very first thing the next person should do?
Not a list. One action. If you cannot name one, the session is not ready to close.}

---

## In progress — pick up here

{What was started but not finished. Be specific:
- Which file, which object, which procedure
- What state it is in (compiles / does not compile / partially implemented)
- What the next step within this work item is}

---

## Completed this session

{What was finished and can be considered done. Brief — this is orientation, not documentation.
Link to commits or PRs if available.}

---

## Open questions / blockers

{What needs a decision, clarification, or external input before work can continue.
Who can answer it. What is blocked until it is answered.}

---

## Decisions made this session

{Significant technical decisions made during this session.
Mark with ✅ ADR created or ⚠️ ADR needed if it has not been created yet.}

---

## Context for next agent / developer

{Anything the next person needs to know that is not obvious from the code.
Recent changes in requirements, customer feedback, team agreement, etc.
Keep it to 3–5 bullet points maximum.}

---

## Relevant ADRs

{Links or references to ADRs that affect the current work.}

---

## Files touched this session

{List of files modified, created, or deleted. Helps the next person orient quickly.}
```

---

## Example 1 — Mid-sprint handoff between developers

```markdown
# Session Handoff — 2026-04-09

**Extension:** CTX Lead Tracking v2
**Session duration:** 4 hours
**Developer / Agent:** Javier
**BC version / environment:** BC 25 SaaS sandbox — company "CTX Demo"

---

## Immediate next action

Run `al_build` and fix the two remaining compilation errors in
`CTXLeadManagement.Codeunit.al` before touching anything else.

---

## In progress — pick up here

**CTXLeadManagement.Codeunit.al — ConvertToCustomer procedure**
- Status: partially implemented, does NOT compile
- Two errors: `OnAfterConvertToCustomer` event missing the `var Customer` parameter
  that the subscriber in `CTXLeadEventHandlers.Codeunit.al` expects
- Fix: add `var Customer: Record Customer` to the OnAfterConvertToCustomer publisher
  signature and update the subscriber to match
- After fix compiles: run the happy path test (create lead → qualify → convert)
  and verify Customer record is created with correct Name and VAT Reg. No.

**CTXLeadCard.Page.al — ConvertToCustomer action**
- Status: action exists and compiles, but `PromotedCategory` is missing
- Add `PromotedCategory = Process` and `PromotedIsBig = true`

---

## Completed this session

- CTX Lead table (Tab50100) — all fields, keys, relations ✅
- CTX Lead API page (Pag50100) — CRUD + ConvertToCustomer bound action ✅
- CTX Lead List page (Pag50101) — compiles, basic layout done ✅
- Extension manifest generated for DELFOS target — `ctx-lead-manifest.md` in project root ✅
- ADR-001 created (event subscribers, not base modification) ✅
- ADR-002 created (Level 1 posting, no G/L) ✅

---

## Open questions / blockers

- ⚠️ **Customer duplicate check on conversion**: should ConvertToCustomer block
  if a Customer with the same VAT Reg. No. already exists, or just warn?
  Currently it blocks (Error). Customer said "warn, not block" in yesterday's call
  but this is not confirmed in writing. → Roberto to confirm with customer before
  implementing the change.

- ⚠️ **Number series for CTX Lead**: setup table has the field, but no default
  number series exists in the demo company. Need to create `CTX-LEAD` number series
  in the sandbox before the happy path test will work.

---

## Decisions made this session

- ConvertToCustomer copies Name, "VAT Registration No.", and Address block from Lead
  to Customer. Phone and Email NOT copied — customer said leads may have informal
  contact data. ✅ ADR-003 created.
- Lead deletion is blocked after conversion (Status = Converted). Leads are never
  deleted — they are archived. ⚠️ ADR needed — Roberto to create before next session.

---

## Context for next agent / developer

- The demo company has no posting setup for sales — do NOT try to post a sales order
  in this session, it will fail with G/L setup errors. Focus only on lead → customer
  conversion, not the downstream sales flow.
- The customer's IT has not yet granted API access to their production environment.
  All testing is in the CTX Demo sandbox only.
- Roberto reviewed the CTX Lead table design and approved it. No more changes to
  the table schema unless a new requirement comes in.

---

## Relevant ADRs

- ADR-001: Use event subscribers, never modify base app
- ADR-002: Posting at Level 1 only
- ADR-003: Customer field mapping on conversion (created today)

---

## Files touched this session

**Created:**
- `src/table/Tab50100.CTXLead.al`
- `src/page/Pag50100.CTXLeadAPI.al`
- `src/page/Pag50101.CTXLeadList.al`
- `src/page/Pag50102.CTXLeadCard.al`
- `.github/decisions/ADR-001-event-subscribers.md`
- `.github/decisions/ADR-002-posting-level-1.md`
- `.github/decisions/ADR-003-customer-field-mapping.md`
- `ctx-lead-manifest.md`

**Modified:**
- `src/codeunit/Cod50100.CTXLeadManagement.al` (IN PROGRESS — does not compile)
- `src/codeunit/Cod50101.CTXLeadEventHandlers.al` (IN PROGRESS — does not compile)
- `app.json` (added idRanges entry for 50100–50199)
```

---

## Example 2 — End of sprint, handoff to AI agent

```markdown
# Session Handoff — 2026-04-09-2

**Extension:** CTX Lead Tracking v2
**Session duration:** 2 hours
**Developer / Agent:** Roberto
**BC version / environment:** BC 25 SaaS sandbox — company "CTX Demo"

---

## Immediate next action

Generate the permission sets for the extension using the bc-permissions skill.
The objects that need coverage are listed in the "Files touched" section below.

---

## In progress — pick up here

**Permission sets — not started**
- Need two sets: `CTX-LEAD-USER` (RIMD on tabledata, X on pages and codeunits)
  and `CTX-LEAD-ADMIN` (includes USER + X on setup page and setup table RIMD)
- Follow the hierarchy pattern from skill-permissions: Base → User → Admin
- File location: `src/permissionset/`

---

## Completed this session

- Fixed compilation errors in CTXLeadManagement.Codeunit.al ✅
- Fixed compilation errors in CTXLeadEventHandlers.Codeunit.al ✅
- ConvertToCustomer happy path test: PASSED ✅
- Customer duplicate check changed from Error to Warning (confirmed with customer) ✅
- CTX-LEAD number series created in sandbox ✅
- ADR-004 created: Lead archiving instead of deletion ✅
- Build: zero errors, zero warnings ✅

---

## Open questions / blockers

- None currently blocking. Customer confirmation on duplicate check received and
  implemented.

---

## Decisions made this session

- Warning on duplicate VAT Reg. No. instead of Error — confirmed by customer. ✅ ADR-003 updated.
- Lead status = Converted is irreversible — no "reopen" action. ✅ ADR-004.

---

## Context for next agent / developer

- The extension now compiles clean. All happy path scenarios pass manual testing.
- Permission sets are the only remaining gap before the v2.0.0 release candidate.
- Do NOT change the ConvertToCustomer logic — it was just confirmed by the customer
  and any change requires a new customer sign-off.
- The DELFOS manifest (`ctx-lead-manifest.md`) is final — DELFOS team has a copy.

---

## Relevant ADRs

- ADR-001: Event subscribers
- ADR-002: Level 1 posting
- ADR-003: Customer field mapping (updated today)
- ADR-004: Lead archiving (created today)

---

## Files touched this session

**Modified:**
- `src/codeunit/Cod50100.CTXLeadManagement.al`
- `src/codeunit/Cod50101.CTXLeadEventHandlers.al`
- `.github/decisions/ADR-003-customer-field-mapping.md` (status updated)

**Created:**
- `.github/decisions/ADR-004-lead-archiving.md`

**Pending (next session):**
- `src/permissionset/CTXLeadUser.permissionset.al`
- `src/permissionset/CTXLeadAdmin.permissionset.al`
```

---

## Tips for writing good Session Handoffs

**Write the Immediate next action last.** After you have written everything else, the most important next step usually becomes obvious.

**Be specific about "in progress" items.** "Working on the codeunit" is useless. "The ConvertToCustomer procedure in Cod50100 compiles but the happy path test fails at step 3 because the Customer record is created but the Address block is empty" is actionable.

**Do not list everything you did.** The Completed section is for orientation, not for a full audit trail. Three to five items is enough — the commit history has the rest.

**Open questions must name who can answer them.** "Unclear" with no owner is not an open question, it is a dead end.

**Keep Context for next agent/developer to 3–5 bullets.** If you write ten bullets, the reader will not know which ones matter.

**Decisions without ADRs are at risk.** If something important was decided and only lives in the handoff, it will be lost when the handoffs pile up. Create the ADR.
