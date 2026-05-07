# AL Report — Pre-commit Checklist

Use this checklist before committing or raising a PR for any Report object or RDLC layout change.

## AL Object (.Report.al)

- [ ] `UsageCategory` declared (e.g. `ReportsAndAnalysis`)
- [ ] `ApplicationArea` declared on the object and on all request page fields
- [ ] All child DataItems have explicit `DataItemLink`
- [ ] All child DataItems have explicit `DataItemTableView` with sorting
- [ ] `rendering` block present with a named layout identifier
- [ ] Layout file path follows `src/reports/layouts/<ReportName>.rdlc`
- [ ] Request page has `SaveValues = true`
- [ ] All request page fields have `Caption` and `ToolTip`
- [ ] `OnPreReport` validates filters and initializes globals
- [ ] No hardcoded company names or environment-specific paths

## RDLC Layout (.rdlc)

- [ ] `PageHeader` `<Height>` matches content (Last Top + Height + ≥ 0.167 cm margin)
- [ ] `PageFooter` `<Height>` matches content (same formula)
- [ ] No fields added/removed from PageHeader or PageFooter without recalculating height
- [ ] SetData new fields appended at the **end** of the expression
- [ ] GetData index map XML comment is up to date
- [ ] Body `<Width>` ≤ Available Page Width
- [ ] If body width exceeded: overflow warning emitted and fix applied
- [ ] Standard row spacing maintained (0.39 cm between consecutive rows)
- [ ] No customer-specific or environment-specific data hardcoded in the layout

## Testing

- [ ] Report renders without layout warnings in RDLC preview
- [ ] All existing fields display correct data (SetData index regression check)
- [ ] New fields display correct data
- [ ] Header and footer not cut off at top or bottom of page
- [ ] Report tested on both A4 and the target paper format if different
