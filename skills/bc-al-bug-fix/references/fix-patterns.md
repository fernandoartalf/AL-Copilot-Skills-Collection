# Fix Patterns & Diagnosis Template

## Table of contents

- [Diagnosis template](#diagnosis-template)
- [FP-01 — CalcFields not called](#fp-01--calcfields-not-called)
- [FP-02 — SetLoadFields truncating data](#fp-02--setloadfields-truncating-data)
- [FP-03 — Event subscriber signature mismatch](#fp-03--event-subscriber-signature-mismatch)
- [FP-04 — Direct assignment instead of Validate](#fp-04--direct-assignment-instead-of-validate)
- [FP-05 — Missing IsHandled check in OnBefore event](#fp-05--missing-ishandled-check-in-onbefore-event)
- [FP-06 — Modify(true) in bulk migration](#fp-06--modifytrue-in-bulk-migration)
- [FP-07 — Missing indirect permission on codeunit](#fp-07--missing-indirect-permission-on-codeunit)
- [FP-08 — CalcSums instead of loop accumulation](#fp-08--calcsums-instead-of-loop-accumulation)
- [FP-09 — FlowField in repeat..until loop](#fp-09--flowfield-in-repeatuntil-loop)
- [FP-10 — OnBeforeDelete missing in tableextension](#fp-10--onbeforedelete-missing-in-tableextension)
- [Checklist before committing the fix](#checklist-before-committing-the-fix)

---

## Diagnosis template

Create this file before writing any code. Name it `{object-name}-diagnosis.md`.

```markdown
# Bug Diagnosis — {Short title}

**Date:** YYYY-MM-DD
**Severity:** Critical / High / Medium / Low
**Status:** Investigating → Diagnosed → Fixed → Verified

## Symptom

{Exact description of what the user observes. Quote the error message if any.}

**Reproducibility:** Always / Intermittent / Specific condition

## Layer and category

- **Layer:** Data / Logic / UI / Integration / Security / Configuration
- **Category:** {from symptom-map.md}

## Hypotheses

| Priority | Root cause | Probability | Evidence for/against |
|---|---|---|---|
| 1 | {cause} | HIGH | {evidence} |
| 2 | {cause} | MEDIUM | {evidence} |
| 3 | {cause} | LOW | {evidence} |

## Confirmed root cause

{Technical explanation. Quote the specific line, trigger, or condition that is wrong.}

## Proposed fix

{One paragraph description of the fix. No code yet — confirm with user first.}

## Regression risk

{What adjacent functionality could be affected by this fix? What test covers it?}

## Tests required

- **Happy path:** {scenario that was broken, now works}
- **Adjacent:** {nearest scenario that must not change}
- **Edge case:** {boundary condition most at risk}
```

---

## Fix patterns by root cause category

---

### FP-01 — CalcFields not called

**Symptom:** FlowField shows 0 or stale value in code but correct in BC UI.

**Root cause:** The BC runtime auto-calculates FlowFields on page load for display, but in AL code you must call `CalcFields` explicitly.

```al
// ❌ Wrong — FlowField not calculated
Customer.Get(CustomerNo);
TotalBalance := Customer."Balance (LCY)";  // always 0

// ✅ Fix — call CalcFields before reading
Customer.SetLoadFields("Balance (LCY)");
Customer.Get(CustomerNo);
Customer.CalcFields("Balance (LCY)");
TotalBalance := Customer."Balance (LCY)";
```

**Rule:** One `CalcFields` call per record per code path. Never inside a `repeat...until` loop — call it once outside if possible, or use `CalcSums` for aggregations.

---

### FP-02 — SetLoadFields truncating data

**Symptom:** Field exists on the record but reads as empty/0/false after `FindSet`/`Get`.

**Root cause:** `SetLoadFields` was called but did not include the field being read.

```al
// ❌ Wrong — "Amount" not in SetLoadFields, always reads as 0
SalesLine.SetLoadFields("No.", Quantity);
if SalesLine.FindSet() then
    repeat
        Total += SalesLine.Amount;  // Amount not loaded, reads 0
    until SalesLine.Next() = 0;

// ✅ Fix — add the missing field
SalesLine.SetLoadFields("No.", Quantity, Amount);
if SalesLine.FindSet() then
    repeat
        Total += SalesLine.Amount;
    until SalesLine.Next() = 0;
```

**Rule:** Every field read after `FindSet`/`Get` must be in `SetLoadFields`. When in doubt, remove `SetLoadFields` during debugging to confirm this is the cause, then add back with the complete list.

---

### FP-03 — Event subscriber signature mismatch

**Symptom:** Subscriber exists in code, no compile error, but it never fires.

**Root cause:** The subscriber parameter list does not exactly match the publisher. AL resolves subscribers by signature matching — a mismatch means the subscriber is silently ignored.

```al
// ❌ Wrong — parameter name or type differs from publisher
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", 'OnBeforePostSalesDoc', '', false, false)]
local procedure OnBeforePost(var SalesHeader: Record "Sales Header"; var IsHandled: Boolean)
// Publisher actually has: CommitIsSuppressed: Boolean as second parameter — subscriber never fires

// ✅ Fix — match the publisher signature exactly
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", 'OnBeforePostSalesDoc', '', false, false)]
local procedure OnBeforePost(
    var SalesHeader: Record "Sales Header";
    CommitIsSuppressed: Boolean;
    var IsHandled: Boolean)
begin
    // now fires correctly
end;
```

**How to find the correct signature:** Use `al_get_object_definition` on the publisher codeunit, or search the BC base app source on GitHub. Never guess parameter names or order.

---

### FP-04 — Direct assignment instead of Validate

**Symptom:** Field value changes but related fields (totals, dependent lookups) do not update.

**Root cause:** Direct assignment (`Rec.Field := value`) bypasses the `OnValidate` trigger. All business logic in `OnValidate` is skipped.

```al
// ❌ Wrong — OnValidate skipped, related fields not updated
SalesLine."No." := ItemNo;
// Unit price, description, unit of measure NOT populated

// ✅ Fix — use Validate to trigger business logic
SalesLine.Validate("No.", ItemNo);
// Unit price, description, unit of measure populated by OnValidate
```

**Exception:** Use direct assignment intentionally when you want to set a value without triggering side effects — for example during data migration with `Modify(false)`. Document this intent explicitly.

---

### FP-05 — Missing IsHandled check in OnBefore event

**Symptom:** Default BC logic still runs even though a subscriber is supposed to replace it.

**Root cause:** The subscriber sets `IsHandled := true` but the calling codeunit does not check `IsHandled` after raising the event. OR the subscriber does not set `IsHandled := true`.

```al
// Publisher pattern — must check IsHandled after raising
local procedure DoSomething(var Rec: Record Customer)
var
    IsHandled: Boolean;
begin
    OnBeforeDoSomething(Rec, IsHandled);
    if IsHandled then  // ← this check must exist
        exit;

    // default logic
end;

// Subscriber — must set IsHandled to skip default logic
[EventSubscriber(...)]
local procedure OnBeforeDoSomethingHandler(var Rec: Record Customer; var IsHandled: Boolean)
begin
    // custom logic
    IsHandled := true;  // ← must be set to prevent default logic
end;
```

---

### FP-06 — Modify(true) in bulk migration

**Symptom:** Data migration codeunit runs slowly or fires unintended side effects on existing records.

**Root cause:** `Modify(true)` fires all table triggers and event subscribers on every record. In a migration context this is almost never desired and causes huge performance impact.

```al
// ❌ Wrong — fires triggers on every record, extremely slow
if Customer.FindSet() then
    repeat
        Customer."New Field" := TransformValue(Customer."Old Field");
        Customer.Modify(true);  // fires OnModify, all subscribers
    until Customer.Next() = 0;

// ✅ Fix — use Modify(false) for migration, document why
if Customer.FindSet() then
    repeat
        Customer."New Field" := TransformValue(Customer."Old Field");
        Customer.Modify(false);  // intentional: bypass triggers during migration
    until Customer.Next() = 0;
```

---

### FP-07 — Missing indirect permission on codeunit

**Symptom:** Permission error at runtime for a regular user, but works for admin.

**Root cause:** A codeunit accesses a table on behalf of the user. BC requires the codeunit to declare indirect permissions explicitly if the user may not have direct table access.

```al
// ❌ Wrong — codeunit accesses table, user gets permission error
codeunit 50100 "My Process"
{
    // no Permissions property — user needs direct table access
    procedure Run()
    var
        MyTable: Record "My Sensitive Table";
    begin
        MyTable.Insert();  // user needs Insert on table directly
    end;
}

// ✅ Fix — declare indirect permissions on codeunit
codeunit 50100 "My Process"
{
    Permissions = tabledata "My Sensitive Table" = RIMD;  // codeunit gets access, user doesn't need it

    procedure Run()
    var
        MyTable: Record "My Sensitive Table";
    begin
        MyTable.Insert();  // codeunit permission covers this
    end;
}
```

---

### FP-08 — CalcSums instead of loop accumulation

**Symptom:** Aggregation is correct but slow on large datasets.

**Root cause:** Manual `repeat...until` loop accumulating a sum — the sum is computed in AL, not pushed to the database.

```al
// ❌ Wrong — fetches all rows, sums in AL
CustLedgerEntry.SetRange("Customer No.", CustomerNo);
if CustLedgerEntry.FindSet() then
    repeat
        Total += CustLedgerEntry.Amount;
    until CustLedgerEntry.Next() = 0;

// ✅ Fix — single aggregation query at DB level
CustLedgerEntry.SetRange("Customer No.", CustomerNo);
CustLedgerEntry.CalcSums(Amount);
Total := CustLedgerEntry.Amount;
```

**Rule:** Any sum over a filtered record set should use `CalcSums`. Use a loop only when you need to apply logic to individual records.

---

### FP-09 — FlowField in repeat..until loop

**Symptom:** List page or report extremely slow, performance degrades linearly with record count.

**Root cause:** `CalcFields` called inside a loop — one aggregation query per iteration.

```al
// ❌ Wrong — one DB query per customer
if Customer.FindSet() then
    repeat
        Customer.CalcFields("Balance (LCY)");  // query per row
        if Customer."Balance (LCY)" > Threshold then
            // do something
    until Customer.Next() = 0;

// ✅ Fix — use a join query or accept the FlowField is for display only
// Option A: restructure to avoid CalcFields in loop
// Option B: use a Query object to join Customer + Cust. Ledger Entry
// Option C: mark field as Additional importance on list page so it's not auto-loaded
```

---

### FP-10 — OnBeforeDelete missing in tableextension

**Symptom:** Deleting a parent record leaves orphan child records in a custom table.

**Root cause:** The base table's `OnDelete` trigger fires, but the tableextension's cleanup code uses `OnBeforeDelete` and it was never added — or `DeleteAll` was used which bypasses triggers.

```al
// In tableextension — add OnBeforeDelete cleanup
tableextension 50100 "My Customer Ext" extends Customer
{
    trigger OnBeforeDelete()
    var
        MyRelatedRecord: Record "My Related Table";
    begin
        MyRelatedRecord.SetRange("Customer No.", Rec."No.");
        MyRelatedRecord.DeleteAll(true);  // true = run triggers on related records too
    end;
}
```

**Important:** If the parent records are deleted via `DeleteAll`, triggers on the parent do NOT fire. You need an additional event subscriber on `OnBeforeDeleteEvent` with `RunTrigger = true` parameter check, or a separate cleanup job.

---

## Checklist before committing the fix

- [ ] Diagnosis document written and confirmed by user
- [ ] Fix is minimal — only addresses the confirmed root cause
- [ ] No unrelated refactoring in the same commit
- [ ] `Modify(false)` used if this is a data migration fix (with comment)
- [ ] `SetLoadFields` updated to include all fields now being read
- [ ] Event subscriber signature verified against publisher (not assumed)
- [ ] Permission set updated if new table access was added
- [ ] Happy path test defined
- [ ] Adjacent regression test defined
- [ ] Edge case test defined
- [ ] Skills Evidencing block written
