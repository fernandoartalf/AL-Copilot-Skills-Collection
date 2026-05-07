# SetData / GetData Index Guide

## How SetData and GetData work

Business Central RDLC reports use a `SetData` / `GetData` pattern implemented in the RDLC's embedded VB.NET code block.

- `SetData(value, groupNumber)` stores a delimited string of field values for a given group.
- `GetData(index, groupNumber)` retrieves a single field value by its **1-based sequential position** in that string.

The delimiter between fields is `Chr(177)` (the `±` character, unlikely to appear in real data).

## Index Corruption Risk

Because indices are positional, inserting a new field anywhere except the end **silently shifts all subsequent indices**. The RDLC textboxes that reference `GetData(N, group)` will start returning the wrong field — no compile error, no runtime error, just wrong data on the printed report.

## Step-by-Step: Adding a New Field Safely

### 1. Locate the SetData expression

Find the expression that builds the delimited string, typically inside a Textbox that is invisible (Hidden = true), often named `SetDataGroup2` or similar.

### 2. Count the existing fields

```vb
Fields!Field1.Value + Chr(177) +   ' 1
Fields!Field2.Value + Chr(177) +   ' 2
Fields!Field3.Value                ' 3  ← N = 3
```

### 3. Append at the end

```vb
Fields!Field1.Value + Chr(177) +   ' 1
Fields!Field2.Value + Chr(177) +   ' 2
Fields!Field3.Value + Chr(177) +   ' 3 (add Chr(177) after last existing field)
Fields!NewLabel.Value + Chr(177) + ' 4 ← new
Fields!NewValue.Value              ' 5 ← new
```

### 4. Update the index comment block

Always maintain an XML comment immediately before or after the SetData textbox:

```xml
<!--
  SetData Group 2 — Field Index Map
  1:  CustomerName
  2:  CustomerAddress
  3:  DocumentDate
  4:  NewLabel      (added 2026-04-30)
  5:  NewValue      (added 2026-04-30)
-->
```

### 5. Add textboxes using the new indices

```xml
<Textbox Name="NewLabelBox">
  <Value>=Code.GetData(4, 2)</Value>
</Textbox>
<Textbox Name="NewValueBox">
  <Value>=Code.GetData(5, 2)</Value>
</Textbox>
```

## Quick Verification Checklist

- [ ] Counted existing fields before making changes
- [ ] New fields appended after the last `Chr(177)` separator
- [ ] Index comment block updated with new entries and date
- [ ] New textboxes reference correct `GetData(N+x, group)` indices
- [ ] Existing textboxes not modified (their indices are unchanged)
- [ ] Report tested: all existing fields still display correct data
