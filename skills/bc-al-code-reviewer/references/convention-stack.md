# Convention Stack — Complete Rule Set

Full rule catalogue for all five review categories. Each rule includes its source, priority, and the exact check to perform.

**Priority sources:**
- **P1** — AppSource validation requirements (blocks publication)
- **P2** — CodeCop / PerTenantExtensionCop analyzer rules
- **P3** — alguidelines.dev community standard
- **P4** — al-copilot-skills catalogue patterns

## Table of contents

- [Category 1 — Naming & Structure](#category-1--naming--structure) — NS-01 to NS-09
- [Category 2 — Performance Anti-Patterns](#category-2--performance-anti-patterns) — PF-01 to PF-07
- [Category 3 — Extensibility Contract](#category-3--extensibility-contract) — EX-01 to EX-05
- [Category 4 — SaaS Readiness](#category-4--saas-readiness) — SR-01 to SR-06
- [Category 5 — AppSource Blockers](#category-5--appsource-blockers) — summary (full detail in appsource-blockers.md)

---

## Category 1 — Naming & Structure {#naming}

### NS-01 — Object prefix/suffix
**Priority:** P1 | **Severity:** 🔴 Blocker

Every custom object (table, page, codeunit, report, query, enum, xmlport) and every custom field on a table extension must have a registered prefix or suffix applied consistently.

```al
// ❌ Wrong
table 50100 "Lead"
field(1; Status; Option)

// ✅ Correct
table 50100 "CTX Lead"
field(1; "CTX Status"; Option)
```

**Source:** [AppSource checklist](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-checklist-submission)

---

### NS-02 — File naming convention
**Priority:** P3 | **Severity:** 🔵 Suggestion

File names follow the pattern `{ObjectName}.{ObjectType}.al`. The object type is spelled out, not abbreviated.

| Object type | Correct file name |
|---|---|
| Codeunit | `CTXLeadManagement.Codeunit.al` |
| Table | `CTXLead.Table.al` |
| Page | `CTXLeadCard.Page.al` |
| TableExtension | `CTXCustomerExt.TableExt.al` |
| PageExtension | `CTXCustomerCardExt.PageExt.al` |

**Source:** [alguidelines.dev — File Naming](https://alguidelines.dev/docs/patterns/file-naming)

---

### NS-03 — Object ID within idRanges
**Priority:** P1 | **Severity:** 🔴 Blocker

Every object ID must fall within the `idRanges` declared in `app.json`. IDs outside the range cause submission rejection.

**Check:** Extract all object IDs from code, compare against `app.json` idRanges. Flag any ID outside the range.

**Source:** AppSource validation

---

### NS-04 — No WITH statements
**Priority:** P2 | **Severity:** 🔴 Blocker

`WITH` statements are deprecated and cause `AA0007` CodeCop warnings. They are prohibited when the `NoImplicitWith` feature is enabled (required from runtime 11.0+).

```al
// ❌ Wrong
with SalesHeader do begin
    "Document Type" := "Document Type"::Order;
    Insert(true);
end;

// ✅ Correct
SalesHeader."Document Type" := SalesHeader."Document Type"::Order;
SalesHeader.Insert(true);
```

**Source:** [CodeCop AA0007](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/codecop-aa0007)

---

### NS-05 — Label Locked property
**Priority:** P2 | **Severity:** 🟡 Warning

Labels that should not be translated (event IDs, API strings, technical constants) must have `Locked = true`. Labels without `Locked = true` appear in translation files and may be incorrectly translated.

```al
// ❌ Wrong — event ID will appear in translation files
EventIdLbl: Label 'CTX-SALES-001';

// ✅ Correct
EventIdLbl: Label 'CTX-SALES-001', Locked = true;
```

**Source:** [alguidelines.dev — Labels](https://alguidelines.dev/docs/patterns/labels)

---

### NS-06 — ObsoleteState requires ObsoleteReason and ObsoleteTag
**Priority:** P2 | **Severity:** 🟡 Warning

Every object or field with `ObsoleteState = Pending` or `ObsoleteState = Removed` must have both `ObsoleteReason` (explaining what to use instead) and `ObsoleteTag` (the version when it will be removed).

```al
// ❌ Wrong
field(10; "Old Field"; Text[50])
{
    ObsoleteState = Pending;
}

// ✅ Correct
field(10; "Old Field"; Text[50])
{
    ObsoleteState = Pending;
    ObsoleteReason = 'Use "New Field" instead. Will be removed in v3.0.';
    ObsoleteTag = '3.0';
}
```

**Source:** [CodeCop AA0072](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/analyzers/codecop-aa0072)

---

### NS-07 — No hardcoded environment values
**Priority:** P3 | **Severity:** 🟡 Warning

No hardcoded company names, environment URLs, user IDs, or tenant IDs in code. These break when the extension is deployed to a different environment.

```al
// ❌ Wrong
if CompanyName = 'CRONUS International Ltd.' then

// ✅ Correct — use setup table or parameter
if CompanyName = CTXSetup."Default Company" then
```

**Source:** alguidelines.dev, al-copilot-skills

---

### NS-08 — PascalCase for procedures, camelCase for local variables
**Priority:** P3 | **Severity:** 🔵 Suggestion

```al
// ❌ Wrong
local procedure calculate_total(salesHeader: Record "Sales Header"): Decimal
var
    TotalAmount: Decimal;

// ✅ Correct
local procedure CalculateTotal(SalesHeader: Record "Sales Header"): Decimal
var
    totalAmount: Decimal;
```

**Source:** [alguidelines.dev — Naming](https://alguidelines.dev/docs/patterns/naming-conventions)

---

### NS-09 — No suppressWarnings without justification
**Priority:** P1 | **Severity:** 🔴 Blocker

`#pragma warning disable` without a specific rule number and inline justification comment is rejected by AppSource validation.

```al
// ❌ Wrong
#pragma warning disable

// ✅ Correct (if genuinely needed)
#pragma warning disable AA0007 // WITH statement required here for legacy API compatibility — tracked in issue #42
```

**Source:** AppSource validation

---

## Category 2 — Performance Anti-Patterns {#performance}

### PF-01 — SetLoadFields missing before Find*
**Priority:** P3 | **Severity:** 🟡 Warning

Every `FindSet`, `FindFirst`, `Get` that reads specific fields should be preceded by `SetLoadFields` listing only those fields. Without it, all fields are loaded from the database — expensive on wide tables.

```al
// ❌ Wrong — loads all 50+ fields of Customer
Customer.SetRange("Country/Region Code", 'ES');
if Customer.FindSet() then

// ✅ Correct
Customer.SetLoadFields("No.", Name, "Balance (LCY)");
Customer.SetRange("Country/Region Code", 'ES');
if Customer.FindSet() then
```

**Exception:** Acceptable to omit `SetLoadFields` when all fields are genuinely needed, or in test code.

**Source:** [al-copilot-skills skill-performance](https://alguidelines.dev/docs/patterns/performance)

---

### PF-02 — CalcFields inside repeat..until
**Priority:** P3 | **Severity:** 🔴 Blocker (for list pages) / 🟡 Warning (for batch code)

`CalcFields` inside a loop fires one aggregation query per iteration. On large datasets this causes timeouts.

```al
// ❌ Wrong
if Customer.FindSet() then
    repeat
        Customer.CalcFields("Balance (LCY)");  // one query per customer
    until Customer.Next() = 0;

// ✅ Correct — restructure to avoid CalcFields in loop
// Option: use a Query object joining Customer + Cust. Ledger Entry
// Option: accept that Balance is a display-only FlowField, not for batch logic
```

**Source:** al-copilot-skills skill-performance, alguidelines.dev

---

### PF-03 — Database call inside repeat..until
**Priority:** P3 | **Severity:** 🟡 Warning

A `Get`, `FindSet`, or `FindFirst` call inside a loop creates an N+1 query pattern.

```al
// ❌ Wrong — one Get per sales line
if SalesLine.FindSet() then
    repeat
        Item.Get(SalesLine."No.");  // DB call per iteration
    until SalesLine.Next() = 0;

// ✅ Correct — pre-load into temporary table
Item.SetLoadFields("No.", Description, "Unit Price");
if Item.FindSet() then
    repeat
        TempItem := Item;
        TempItem.Insert();
    until Item.Next() = 0;
// then join TempItem in the SalesLine loop
```

**Source:** al-copilot-skills skill-performance

---

### PF-04 — Loop accumulation instead of CalcSums
**Priority:** P3 | **Severity:** 🟡 Warning

Manual sum accumulation over a filtered record set should use `CalcSums` — a single DB aggregation query.

```al
// ❌ Wrong
CustLedgerEntry.SetRange("Customer No.", CustomerNo);
if CustLedgerEntry.FindSet() then
    repeat
        Total += CustLedgerEntry.Amount;
    until CustLedgerEntry.Next() = 0;

// ✅ Correct
CustLedgerEntry.SetRange("Customer No.", CustomerNo);
CustLedgerEntry.CalcSums(Amount);
Total := CustLedgerEntry.Amount;
```

**Source:** al-copilot-skills skill-performance

---

### PF-05 — More than 4 FlowFields on List page
**Priority:** P4 | **Severity:** 🟡 Warning

Each visible FlowField on a List page fires one query per visible row. More than 4 causes noticeable slowdown on typical datasets.

**Check:** Count `FieldClass = FlowField` fields that are `Visible` (default) on List/ListPart pages.

**Source:** al-copilot-skills skill-pages

---

### PF-06 — SetRange after Find*
**Priority:** P3 | **Severity:** 🔴 Blocker

`SetRange` or `SetFilter` applied after `FindSet`/`FindFirst` has no effect — the filter is ignored. This is a silent bug.

```al
// ❌ Wrong — filter applied after FindSet, ignored
if Customer.FindSet() then begin
    Customer.SetRange(Blocked, Customer.Blocked::" ");  // too late, ignored
```

**Source:** alguidelines.dev

---

### PF-07 — Commit inside loop
**Priority:** P2 | **Severity:** 🔴 Blocker

`Commit` inside a loop fragments the transaction, increases lock contention, and can leave data in an inconsistent state if the loop fails midway.

**Source:** CodeCop, alguidelines.dev

---

## Category 3 — Extensibility Contract {#extensibility}

### EX-01 — Business procedure missing OnBefore/OnAfter pair
**Priority:** P4 | **Severity:** 🟡 Warning

Every public business procedure that modifies data should expose an `OnBefore` + `OnAfter` `[IntegrationEvent]` pair so other extensions can integrate without modifying the source.

```al
procedure ProcessLead(var Lead: Record "CTX Lead"): Boolean
var
    IsHandled: Boolean;
begin
    OnBeforeProcessLead(Lead, IsHandled);  // ← must exist
    if IsHandled then
        exit(true);

    // logic

    OnAfterProcessLead(Lead);  // ← must exist
end;

[IntegrationEvent(false, false)]
local procedure OnBeforeProcessLead(var Lead: Record "CTX Lead"; var IsHandled: Boolean)
begin
end;

[IntegrationEvent(false, false)]
local procedure OnAfterProcessLead(var Lead: Record "CTX Lead")
begin
end;
```

**Source:** al-copilot-skills skill-events, alguidelines.dev

---

### EX-02 — OnBefore event missing IsHandled parameter
**Priority:** P4 | **Severity:** 🟡 Warning

`OnBefore` events must include `var IsHandled: Boolean` to allow subscribers to skip the default logic.

**Source:** al-copilot-skills skill-events

---

### EX-03 — IsHandled not checked after OnBefore
**Priority:** P4 | **Severity:** 🟡 Warning

Raising an `OnBefore` event with `IsHandled` but not checking its value afterwards makes the parameter useless — subscribers set it but the default logic still runs.

```al
// ❌ Wrong — IsHandled set by subscriber but never checked
OnBeforeProcessLead(Lead, IsHandled);
// default logic always runs

// ✅ Correct
OnBeforeProcessLead(Lead, IsHandled);
if IsHandled then
    exit;
```

**Source:** al-copilot-skills skill-events

---

### EX-04 — Commit inside event subscriber
**Priority:** P2 | **Severity:** 🔴 Blocker

`Commit` inside an event subscriber breaks the calling transaction, making it impossible for the caller to roll back on error. This is one of the most dangerous patterns in BC extensions.

**Source:** CodeCop, alguidelines.dev

---

### EX-05 — GlobalVarAccess = true without justification
**Priority:** P3 | **Severity:** 🟡 Warning

`[IntegrationEvent(false, true)]` exposes the publisher's global variables to subscribers, creating tight coupling. Use `false` unless there is a specific, documented reason.

**Source:** al-copilot-skills skill-events

---

## Category 4 — SaaS Readiness {#saas}

### SR-01 — InherentPermissions missing on codeunit
**Priority:** P1 | **Severity:** 🔴 Blocker

Every codeunit must declare `InherentPermissions`. Without it, the codeunit cannot run in SaaS environments for non-admin users.

```al
codeunit 50100 "CTX Lead Management"
{
    InherentPermissions = X;  // minimum — execute only
    InherentEntitlements = X;
```

**Source:** PerTenantExtensionCop, AppSource validation

---

### SR-02 — InherentEntitlements missing
**Priority:** P1 | **Severity:** 🔴 Blocker

Same as SR-01 — `InherentEntitlements` required on all objects for SaaS.

**Source:** AppSource validation

---

### SR-03 — DataPerCompany = false without justification
**Priority:** P3 | **Severity:** 🟡 Warning

`DataPerCompany = false` makes data shared across all companies in the tenant. This is rarely correct and always requires explicit justification in a comment.

```al
// ❌ Wrong — no justification
table 50100 "CTX Global Config"
{
    DataPerCompany = false;

// ✅ Correct — justified
table 50100 "CTX Global Config"
{
    // DataPerCompany = false: license key is tenant-wide, not company-specific
    DataPerCompany = false;
```

**Source:** al-copilot-skills skill-setup-table-generator

---

### SR-04 — Secret stored in plain text field
**Priority:** P1 | **Severity:** 🔴 Blocker

API keys, passwords, and credentials must be stored in `IsolatedStorage`, never in table fields as plain `Text`.

```al
// ❌ Wrong
field(10; "API Key"; Text[250]) { }

// ✅ Correct — use IsolatedStorage
procedure SetAPIKey(NewKey: SecretText)
begin
    IsolatedStorage.Set('CTXAPIKey', NewKey, DataScope::Company);
end;
```

**Source:** AppSource validation, alguidelines.dev

---

### SR-05 — External service called without ExecutionContext guard
**Priority:** P3 | **Severity:** 🟡 Warning

Event subscribers that call external services (HTTP, email, webhook) must check `ExecutionContext` to avoid firing during install, upgrade, or other non-normal contexts.

```al
[EventSubscriber(...)]
local procedure OnAfterPostSalesDoc(...)
begin
    if Session.GetExecutionContext() <> ExecutionContext::Normal then
        exit;
    // safe to call external service
end;
```

**Source:** al-copilot-skills bc-upgrade-codeunit-generator, alguidelines.dev

---

### SR-06 — NonDebuggable missing on secret-handling procedures
**Priority:** P3 | **Severity:** 🟡 Warning

Procedures that handle `SecretText` or read from `IsolatedStorage` should be marked `[NonDebuggable]` to prevent secrets from appearing in debugger sessions.

**Source:** alguidelines.dev

---

## Category 5 — AppSource Blockers {#appsource}

See `references/appsource-blockers.md` for the complete list.

Summary of the most commonly missed blockers:

| Rule | Description |
|---|---|
| AS-01 | Prefix/suffix not registered with Microsoft |
| AS-02 | Access to base app non-public procedures |
| AS-03 | Test app not in separate project |
| AS-04 | `logo` missing from app.json |
| AS-05 | `brief` / `description` missing or too short in app.json |
| AS-06 | `privacyStatementUrl` missing |
| AS-07 | `helpBaseUrl` missing or pointing to localhost |
| AS-08 | `TranslationFile` feature not enabled |
| AS-09 | `ObsoleteState = Removed` object still referenced |
| AS-10 | `suppressWarnings` pragma hiding CodeCop errors |
| AS-11 | `dependencies` pointing to non-published extensions |
| AS-12 | Hardcoded object IDs in `RunObject` or `RunPageView` |
