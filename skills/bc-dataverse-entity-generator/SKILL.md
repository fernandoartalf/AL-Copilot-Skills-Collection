---
name: bc-dataverse-entity-generator
description: Generates AL CDS integration table objects from Dataverse entities using ALTPGen with PowerShell automation scripts. REQUIRES terminal tools. Automatically determines next available table ID, EXECUTES the generation script via terminal, monitors for errors (especially ALTPGen path issues), auto-fixes configuration problems, handles post-generation file organization to src/Table/ with BCS prefix naming convention, DELETES original generated file to prevent duplicates, and UPDATES permission set automatically. FULLY AUTOMATED workflow - agent executes all commands directly. If terminal tools are unavailable, agent must decline to proceed.
---

# Business Central Dataverse Entity Generator

Generates AL table objects from Microsoft Dataverse entities using ALTPGen and PowerShell automation. Automates the **COMPLETE** workflow: table ID allocation, command execution, error detection/fixing, file organization with BCS prefix, **original file deletion**, and **automatic permission set updates**.

> **⚡ FULLY AUTOMATED:** Agent takes control of the terminal and executes all commands automatically. User interaction only required for authentication (browser popup for first-time OAuth).

> **🚨 TERMINAL TOOLS REQUIRED:** This skill REQUIRES terminal command execution. If unavailable, agent must decline to proceed.

## Prerequisites

- **Terminal tools enabled** (REQUIRED)
- AL Language extension installed in VS Code (includes ALTPGen)
- Azure AD App Registration with `Dynamics CRM > user_impersonation` permission
- Access to target Dataverse environment
- PowerShell scripts configured in `.github/skills/bc-dataverse-entity-generator/scripts/`

## Automated Workflow

### Step 0: Check Terminal Tools Availability

**BEFORE starting, verify terminal tools are available:**

```
if terminal tools NOT available:
    ❌ This process requires terminal command execution to be enabled.
    
    The bc-dataverse-entity-generator skill cannot run manually because it requires:
    - Automatic error detection and path fixing
    - Real-time monitoring of ALTPGen output
    - Automated file organization and cleanup
    - Permission set updates
    
    Please enable terminal tools in VS Code agent settings to use this skill.
    
    STOP — do not proceed
```

### Step 1: Analyze Request & Determine Next Table ID

- Extract entity name from user request (lowercase: "account", "contact", "quote")
- Scan existing tables in `src/Table/*.al`
- Extract table IDs using regex: `table\s+(\d+)`
- Find highest ID and add 1
- Verify within `app.json` idRanges

### Step 2: Execute PowerShell Generation Script

Build and execute command:
```powershell
cd .github\skills\bc-dataverse-entity-generator\scripts
powershell -ExecutionPolicy Bypass -File ".\Generate-Entity.ps1" -Entity "{entity}" -BaseId {tableId}
```

**Agent MUST execute directly via terminal tools**

Inform user while executing:
```
Generating {Entity} CDS table...
Entity: {entity}
Table ID: {tableId} (next available)
Note: Browser may prompt for authentication (first run only)
```

Monitor terminal output for completion or errors.

### Step 3: Error Handling & Auto-Fix

**ALTPGen Path Error:**
1. Search for `altpgen.exe` in VS Code extensions: `C:\Users\{User}\.vscode\extensions\ms-dynamics-smb.al-*\bin\win32\altpgen\altpgen.exe`
2. Find latest version automatically
3. Update `$AltpgenPath` in Generate-Entity.ps1
4. Re-execute generation script

**Base Path Error:**
1. Add extra `Split-Path` to calculate correct project root
2. Update script
3. Re-execute

**Other Errors:**
- **Authentication:** Inform user to complete browser popup
- **Entity not found:** Verify entity name (lowercase) exists in Dataverse
- **Duplicate ID:** Find next available ID, re-execute with new ID
- **Network:** Check ServiceUri and connectivity

### Step 4: Post-Generation File Organization

**Automatic steps:**

1. **Locate generated file** in project root (e.g., `Account.al`, `CDSaccount.Table.al`)

2. **Read file content and apply BCS prefix:**
   - Find table declaration: `table \d+ "CDS {Entity}"`
   - Update to: `table {id} "BCS CDS {Entity}"`

3. **Create properly named file:**
   - Write content to: `src/Table/BCSCDS{Entity}.Table.al`
   - Example: `Account.al` → `src/Table/BCSCDSAccount.Table.al`

4. **Delete original file** from project root to prevent duplicate object errors

5. **Update permission set** (`AGENTDEMO.permissionset.al`):
   - Parse existing Permissions section
   - Add `tabledata "BCS CDS {Entity}"=RIMD,` in tabledata section (alphabetical order)
   - Add `table "BCS CDS {Entity}"=X,` in table section (alphabetical order)
   - Maintain proper comma placement (last entry ends with `;`)

6. **Confirm completion:**
```
✅ {Entity} CDS table generated successfully!

Created: src/Table/BCSCDS{Entity}.Table.al
Table ID: {tableId}
Table Name: "BCS CDS {Entity}"

✅ Cleaned up: Deleted {originalFile} from project root
✅ Updated: AGENTDEMO.permissionset.al with table permissions

Next steps:
- Review the generated table structure
- Build project: Ctrl+Shift+P → AL: Build
- Test integration with Dataverse environment
```

## Configuration: Sensitive Variables

Scripts contain environment-specific and sensitive values in `Generate-Entity.ps1`:

| Variable | Type | Purpose | How to Find |
|----------|------|---------|-------------|
| `$ServiceUri` | **ENVIRONMENT** | Dataverse environment URL | Power Platform Admin Center > Environments > Environment URL |
| `$ClientId` | **SECRET** | Azure AD App Registration client ID | Azure Portal > App Registrations > Application (client) ID |
| `$RedirectUri` | **SECRET** | OAuth redirect URI (auto-generated from ClientId) | Format: `msal{ClientId}://auth` |
| `$AltpgenPath` | **ENVIRONMENT** | Path to ALTPGen.exe (version-specific) | VS Code extensions folder (agent can auto-detect) |

**See script comments for detailed configuration instructions.**

## Common Entity Names

| Entity | Description |
|--------|-------------|
| `account` | Customer/company |
| `contact` | Person |
| `lead` | Potential customer |
| `opportunity` | Sales opportunity |
| `quote` | Price quote |
| `salesorder` | Sales order |
| `invoice` | Customer invoice |
| `product` | Product/service |

## Troubleshooting

### Error: "ALTPGen tool not found"
**Auto-fix:** Agent searches for ALTPGen.exe, updates path, re-executes

### Error: "Authentication failed"
- Verify `$ClientId` is correct
- Check redirect URI in Azure: `msal{ClientId}://auth`
- Ensure user has Dataverse access
- Check API permissions: `Dynamics CRM > user_impersonation`

### Error: "Entity not found"
- Verify entity exists in Dataverse
- Use lowercase schema name (e.g., `account`, not `Account`)

### Error: "Duplicate table ID" or "Duplicate object"
**Auto-fix (ID):** Agent rescans for next available ID, re-executes
**Fix (duplicate object):** Check for leftover files in project root; agent should delete automatically

## Permission Set Update Details

**File structure:** `namespace AGENTDEMO; permissionset 70000 AGENTDEMO { Assignable = true; Permissions = ... }`

**Sections order:** tabledata → table → codeunit → page

**Format:**
```al
Permissions = 
    tabledata "BCS CDS Account"=RIMD,
    tabledata "BCS CDS Contact"=RIMD,
    table "BCS CDS Account"=X,
    table "BCS CDS Contact"=X,
    codeunit "BCS ..."=X,
    page "BCS ..."=X;
```

**Rules:**
- Maintain alphabetical order within each section
- Each entry ends with `,` except the last entry (ends with `;`)
- Use proper spacing and indentation

## Quick Reference

### Navigate to Scripts
```powershell
cd .github\skills\bc-dataverse-entity-generator\scripts
```

### Generate Single Entity (Manual)
```powershell
powershell -ExecutionPolicy Bypass -File ".\Generate-Entity.ps1" -Entity "account" -BaseId 70004
```

### Find Next Table ID (Manual)
```powershell
Get-ChildItem ..\..\..\..\src\Table\*.al | 
  ForEach-Object { if ((Get-Content $_.FullName -Raw) -match 'table\s+(\d+)') { [int]$matches[1] } } | 
  Sort-Object | Select-Object -Last 1
```

## Script Locations

```
.github/skills/bc-dataverse-entity-generator/
├── SKILL.md                          # This file
├── scripts/
│   ├── Generate-Entity.ps1           # Single entity generator (with sensitive variable documentation)
│   └── Generate-Entity-List.ps1      # Batch entity generator
```

## External Resources

- [ALTPGen Technical Reference](https://yzhums.com/17065/)
- [Azure AD App Registration](https://learn.microsoft.com/entra/identity-platform/quickstart-register-app)
- [Power Platform Admin Center](https://admin.powerplatform.microsoft.com/)

## Agent Workflow Summary

1. ✅ Check terminal tools available (STOP if not)
2. ✅ Extract entity name, determine next table ID
3. ✅ Execute PowerShell script via terminal
4. ✅ Monitor output, auto-fix errors (ALTPGen path, base path)
5. ✅ Locate generated file in project root
6. ✅ Apply BCS prefix, create file in src/Table/
7. ✅ Delete original file from project root
8. ✅ Update AGENTDEMO.permissionset.al automatically
9. ✅ Confirm completion with file paths and next steps
