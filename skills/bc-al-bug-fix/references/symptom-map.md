# BC Symptom → Root Cause Catalogue

BC-specific symptoms mapped to their most likely root causes. Use this during Step 1 triage to narrow hypotheses before reading code.

---

## 1. Wrong value shown on page

### 1.1 FlowField shows 0 or stale value

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | `CalcFields` not called in code path | HIGH | Value correct in table, wrong on page in code context |
| 2 | `SetLoadFields` excludes the FlowField | HIGH | Other fields load fine, only this one is 0 |
| 3 | `CalcFormula` filter references wrong field | MEDIUM | Value is a number but wrong amount |
| 4 | Missing `SumIndexFields` key for CalcFormula | LOW | Correct on small datasets, wrong on large ones |
| 5 | Circular FlowField dependency (AL0896) | LOW | Compiler warning present |

**Quick check:** Does the field show the right value in the BC UI but wrong in code? → `CalcFields` missing.

---

### 1.2 Regular field shows wrong value

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | `SetLoadFields` truncating the field list | HIGH | Other fields on the same record also suspicious |
| 2 | `xRec` used instead of `Rec` in trigger | HIGH | Value correct on first open, wrong after edit |
| 3 | Wrong filter applied before `Get`/`Find` | MEDIUM | Different records show same wrong value |
| 4 | Field modified in event subscriber without intent | MEDIUM | Value was correct before an extension was installed |
| 5 | Data migration ran with wrong values | LOW | All existing records wrong, new records correct |

---

### 1.3 Decimal shows 0 after calculation

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Integer division — both operands are Integer type | HIGH | Formula looks right but result is always 0 or truncated |
| 2 | `Round` function rounding to 0 | MEDIUM | Small values always 0, large values correct |
| 3 | Field not validated — `Validate` not called | MEDIUM | Related fields not updated after assignment |

**Quick check:** Cast one operand to Decimal explicitly: `Result := Rec.Qty * 1.0 / Rec.Total`.

---

## 2. Record not found

### 2.1 `Get` returns false unexpectedly

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Wrong company context | HIGH | Works in one company, fails in another |
| 2 | Key fields in wrong order or incomplete | HIGH | Only some records fail |
| 3 | `SetRange` filter active before `Get` | MEDIUM | `Get` ignores filters — but a preceding `SetRange` on a global variable persists |
| 4 | Record deleted by concurrent process | LOW | Intermittent failure |
| 5 | Permission — no Read on table | LOW | Error is actually a permission error surfaced as not found |

**Quick check:** `Get` ignores filters. If you set `SetRange` on a record variable and then call `Get`, the filter is irrelevant to `Get` but may affect subsequent `FindSet`. Check if the variable is reused.

---

### 2.2 `FindSet` / `FindFirst` returns empty

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Filter too restrictive — wrong field or value | HIGH | Removing one filter makes it work |
| 2 | `SetRange` on a Date field with wrong format | HIGH | Date comparison fails silently |
| 3 | Wrong `SecurityFilter` scope | MEDIUM | Works for admin, fails for regular user |
| 4 | `DataPerCompany = false` table accessed with company filter | LOW | Tenant-wide table filtered by company |
| 5 | TableRelation filter applied implicitly | LOW | Related record exists but filtered out |

---

## 3. Action / trigger not executing

### 3.1 Event subscriber not firing

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Signature mismatch — parameter name, type, or order wrong | HIGH | No compile error but subscriber never called |
| 2 | Wrong `ObjectType` or `ObjectId` in attribute | HIGH | Easy to get wrong on table vs codeunit |
| 3 | `IsHandled = true` set by a prior subscriber | MEDIUM | Other subscribers for same event DO fire |
| 4 | `SkipOnMissingLicense` skipping silently | MEDIUM | Works in some user contexts, not others |
| 5 | Extension not published / not active | LOW | Check extension list |

**Quick check:** The subscriber attribute `[EventSubscriber(ObjectType::Table, Database::"Customer", 'OnAfterInsert', '', false, false)]` — the `ObjectId` must be the exact table/codeunit, the event name must be spelled exactly, including case.

---

### 3.2 OnValidate trigger not firing

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Field assigned directly (`Rec.Field := value`) instead of `Rec.Validate(Field, value)` | HIGH | Value changes but related fields don't update |
| 2 | `IsHandled` set to true in another subscriber | MEDIUM | Trigger fires for some users, not others |
| 3 | Trigger in tableextension but base table trigger runs first and errors | MEDIUM | Error before tableextension trigger executes |

---

### 3.3 Action on page does nothing

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | `Enabled` expression evaluates to false | HIGH | Action visible but greyed out or click has no effect |
| 2 | `Visible` expression hides it but layout glitch shows it | MEDIUM | Inconsistent across records |
| 3 | Missing permission on codeunit called by action | MEDIUM | Works for admin, fails silently for users |
| 4 | `CurrPage.Update()` not called after action — UI not refreshed | LOW | Action runs but page looks unchanged |

---

## 4. Posting failures

### 4.1 Error during posting — unexpected validation

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Event subscriber in OnBefore posting event errors | HIGH | Error message mentions an unexpected codeunit |
| 2 | Missing mandatory field added by extension | HIGH | Error mentions a field that is custom |
| 3 | `TestField` on a field not populated by the posting flow | MEDIUM | Field exists but was never required before |
| 4 | G/L account or posting group missing | MEDIUM | Configuration error, not code |
| 5 | Commit inside event subscriber conflicting with posting transaction | LOW | Intermittent, only under load |

---

### 4.2 Posting succeeds but ledger entry wrong

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Amount calculation error before posting codeunit | HIGH | Amount visible on document before posting is already wrong |
| 2 | Event subscriber modifies amount in OnBefore posting | MEDIUM | Amount correct before subscriber fires, wrong after |
| 3 | Wrong G/L account resolved from posting group | MEDIUM | Posted to wrong account, right amount |
| 4 | Rounding difference not handled | LOW | Off by 1 cent on large amounts |

---

## 5. Permission errors

### 5.1 "You do not have permission to read table X"

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Missing permission set entry for custom table | HIGH | New table added, permission set not updated |
| 2 | Indirect permission not declared on codeunit | MEDIUM | Codeunit accesses table on behalf of user, no `Permissions` property |
| 3 | Wrong `InherentPermissions` on codeunit | MEDIUM | `InherentPermissions = X` without data permissions |
| 4 | User assigned wrong permission set | LOW | Works in SaaS for admin, fails for real user |

---

## 6. Performance symptoms

### 6.1 Page loads slowly

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | FlowField `CalcFields` called inside `repeat...until` loop | HIGH | Performance degrades linearly with record count |
| 2 | Missing `SetLoadFields` — all fields loaded | HIGH | Network/DB time high, all field values available |
| 3 | Too many FlowFields on list page (>4) | MEDIUM | Each FlowField fires a query per visible row |
| 4 | `OnAfterGetRecord` trigger doing expensive operations | MEDIUM | Same slow pattern on every record |
| 5 | Missing index for filter field | LOW | Filter on unindexed field causes full table scan |

---

## 7. Data integrity issues

### 7.1 Duplicate records

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Number series allows manual entry AND auto-entry | HIGH | Duplicates only when number entered manually |
| 2 | `Insert` called without checking existence | HIGH | Batch process creates duplicates on re-run |
| 3 | Race condition — two sessions insert same key simultaneously | LOW | Intermittent, only under load |

---

### 7.2 Orphan records after delete

**Root causes by probability:**

| # | Root cause | Probability | Signal |
|---|---|---|---|
| 1 | Missing `OnBeforeDelete` cleanup in tableextension | HIGH | Related custom records persist after parent deleted |
| 2 | `DeleteAll` used instead of `Delete(true)` — triggers don't fire | HIGH | Works with single delete, fails with bulk delete |
| 3 | Missing `CalcFields`/`CalcSums` reset on related table | LOW | Aggregation wrong after delete |
