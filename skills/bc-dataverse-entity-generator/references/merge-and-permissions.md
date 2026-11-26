# Merging Regenerated Tables and Updating Permissions

## Contents

1. [Detect an existing table](#1-detect-an-existing-table)
2. [Merge new fields](#2-merge-new-fields)
3. [Update vs regenerate decision table](#3-update-vs-regenerate-decision-table)
4. [Add permissions](#4-add-permissions)
5. [Validate the permission set](#5-validate-the-permission-set)

## 1. Detect an existing table

Before keeping a freshly generated table, check whether the entity was generated before:

```powershell
$Entity = 'account'
$existing = Get-ChildItem 'src\Table\*.al' |
    Where-Object { (Get-Content $_.FullName -Raw) -match "table\s+\d+\s+`"BCS CDS $Entity`"" }
```

To avoid overwriting, rename the newly generated file to `*.Table.al.new` before applying the BCS prefix when an existing table is found.

## 2. Merge new fields

1. Read the existing table and the generated table.
2. Compare by `ExternalName` (not field number or AL name — those may have been customized).
3. Append fields whose `ExternalName` is missing in the existing table, inside the `fields { }` block.
4. If a field number collides, use the next free number in the existing table.
5. Keep every custom trigger, procedure, key and property from the existing table.
6. Delete the `.new` file after the merge and build.

Back up the existing table (or rely on git) before merging.

## 3. Update vs regenerate decision table

| Scenario | Action |
|----------|--------|
| Entity never generated before | Use generated table as-is |
| Entity exists, schema unchanged | Discard generated file, keep existing |
| Entity exists, new fields in Dataverse | Merge new fields into existing |
| Entity exists, fields removed in Dataverse | Ask user — manual review required |
| Entity exists, field types changed | Ask user — manual review and testing required |

## 4. Add permissions

Locate the permission set (e.g. `AGENTDEMO.permissionset.al` or any `*.PermissionSet.al` / `*.permissionset.al`):

```powershell
Get-ChildItem -Recurse -Include '*.permissionset.al' -File | Where-Object FullName -notmatch '\\\.alpackages\\'
```

Add both entries for the table inside the `Permissions =` list:

```al
permissionset 70000 "BCS Permissions"
{
    Assignable = true;
    Permissions =
        tabledata "BCS CDS Account" = RIMD,
        table "BCS CDS Account" = X;
}
```

- `R` Read, `I` Insert, `M` Modify, `D` Delete on `tabledata`; `X` Execute on `table`.
- Every entry ends with `,` except the last one, which ends with `;`.
- Skip if the table name is already present (no duplicates).

Prefer editing the file with the agent's edit tool over regex replacement — regex on multi-line AL lists is error-prone.

Alternative: in VS Code run **AL: Generate permission set containing current extension objects** and keep only the required entries.

## 5. Validate the permission set

- Table names match exactly (including the `BCS CDS` prefix).
- Comma/semicolon placement is correct.
- The project builds without errors.
