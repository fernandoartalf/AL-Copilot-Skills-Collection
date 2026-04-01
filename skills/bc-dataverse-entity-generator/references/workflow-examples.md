# Workflow Examples & Troubleshooting

## User Interaction Patterns

### Simple Entity Request

**User:** "Generate the account entity from Dataverse"

**Response:**
1. Find next available table ID → 70004
2. Navigate: `cd .github\skills\bc-dataverse-entity-generator\scripts`
3. Run: `.\Generate-Entity.ps1 -Entity account -BaseId 70004`
4. User authenticates in browser (first run only)
5. Generated file appears in project root as `CDSaccount.Table.al`
6. Move to `src/Table/` and rename to `BCSCDSAccount.Table.al`
7. Update table name in file: `"CDS account"` → `"BCS CDS Account"`
8. Update permission set
9. Build project

### Using Batch Script

**User:** "Generate account, contact, and opportunity entities"

**Response:**
1. Edit `.github\skills\bc-dataverse-entity-generator\scripts\Generate-Entity-List.ps1`
2. Update `$entities` array with desired entities and BaseIds
3. Navigate: `cd .github\skills\bc-dataverse-entity-generator\scripts`
4. Run: `.\Generate-Entity-List.ps1`
5. Script automatically moves files to `src/Table/` with BCS prefix
6. Update permission set
7. Build project

### Updating Existing Entity

**User:** "Regenerate the account entity to get new fields"

**Response:**
1. Find existing table → `BCSCDSAccount.Table.al` (e.g., Table 70004)
2. Navigate: `cd .github\skills\bc-dataverse-entity-generator\scripts`
3. Run generation: `.\Generate-Entity.ps1 -Entity account -BaseId 70004`
4. Compare field lists between old and new files
5. Merge new fields into existing table, preserving custom code/events
6. Delete generated duplicate
7. Build and test

### Multiple Individual Entities

**User:** "Generate contact and opportunity entities"

**Response:** Process sequentially, each entity gets its own table ID. Alternative: update `Generate-Entity-List.ps1` for batch processing.

---

## Existing Table Merge Strategy

When regenerating an entity that already exists:

```powershell
# Detect existing table
$entityPattern = "table\s+\d+\s+`"BCS CDS $Entity`""
$existingTable = Get-ChildItem "src/Table/*.al" | 
  Where-Object { (Get-Content $_.FullName -Raw) -match $entityPattern }

if ($existingTable) {
  Write-Host "⚠️ Found existing table: $($existingTable.Name)"
  Write-Host "Will merge new fields from generated table"
}
```

**Merge decision matrix:**

| Scenario | Action |
|----------|--------|
| Entity never generated before | Use generated table as-is |
| Entity exists, schema unchanged | Skip generation |
| Entity exists, new fields in Dataverse | Merge new fields into existing |
| Entity exists, fields removed in Dataverse | Manual review required |
| Entity exists, field types changed | Manual review and testing required |

---

## Permission Set Update

After generating a table, add permissions:

```al
permissionset 50100 "BCS Permissions"
{
    Assignable = true;
    Caption = 'BCS Custom Permissions';

    Permissions =
        tabledata "BCS CDS Account" = RIMD,
        table "BCS CDS Account" = X;
}
```

**Permission levels:** R (Read), I (Insert), M (Modify), D (Delete), X (Execute metadata)

Alternative: Use VS Code command `AL: Generate permission set containing current extension objects` to auto-generate.

---

## Common Entity Names Reference

| Dataverse Entity | AL Table Name | Business Context |
|------------------|---------------|------------------|
| account | BCS CDS Account | Companies/Organizations |
| contact | BCS CDS Contact | People/Individuals |
| lead | BCS CDS Lead | Sales prospects |
| opportunity | BCS CDS Opportunity | Sales opportunities |
| quote | BCS CDS Quote | Sales quotes |
| salesorder | BCS CDS Sales Order | Sales orders |
| invoice | BCS CDS Invoice | Sales invoices |
| product | BCS CDS Product | Products/Items |
| pricelevel | BCS CDS Price Level | Price lists |
| systemuser | BCS CDS System User | CRM users |
| team | BCS CDS Team | User teams |
| organization | BCS CDS Organization | Organization settings |

---

## Troubleshooting

### ALTPGen Tool Not Found

```powershell
# Find installed AL extension version
Get-ChildItem "$env:USERPROFILE\.vscode\extensions" -Filter "ms-dynamics-smb.al-*"
```
Update `$AltpgenPath` in `Generate-Entity.ps1` to match installed version.

### Authentication Fails

1. Verify Azure AD App Registration has `Dynamics CRM > user_impersonation` permission
2. Confirm Redirect URI matches `msal<ClientId>://auth` format in app registration
3. Ensure user has Dataverse environment access
4. Try re-running with fresh browser session

### Table ID Conflict

1. Re-scan `src/Table/*.al` for latest available ID
2. Check for uncommitted tables in other branches
3. Verify `app.json` ID range allows the chosen ID

### Files Not Generated

1. Verify entity name is correct (lowercase, matches Dataverse schema name)
2. Check ALTPGen console output for errors
3. Confirm entity exists in target Dataverse environment
4. Ensure `$ServiceUri` points to correct environment

### Permission Set Syntax Error

1. Check comma placement (comma after each permission except last)
2. Verify table names are enclosed in double quotes
3. Ensure closing semicolon after last permission entry
4. Use AL formatter (`Alt+Shift+F`) to fix syntax
