# Generate-Entity-List.ps1 — Full Script Reference

The batch entity generation script. Located at `.github/skills/bc-dataverse-entity-generator/scripts/Generate-Entity-List.ps1`. Calls `Generate-Entity.ps1` for each entity in the list, then automatically moves files to `src/Table/` and applies CDS prefix.

## Sensitive Variables

Inherits all sensitive variables from `Generate-Entity.ps1`. Additionally:

| Variable | Type | Description |
|----------|------|-------------|
| `$entities` | **CONFIGURATION** | Entity-to-BaseId mapping. BaseId values must not overlap with existing table IDs in `app.json` range |
| `$objectPrefix` | **CONFIGURATION** | Object naming prefix (e.g., "CDS"). Applied to all generated file names |

## Maintaining the Entity List

To update the entity list from a Dataverse solution:

1. Import the latest `Solution.xml` from the Dataverse solution
2. Use Copilot with prompt: *"update the entities on the file Generate-Entity-List based on the file Solution.xml using all the rootcomponents with type 1 and update the BaseId to avoid ID overlapping. Do not update the BaseID of the current entities defined on the script"*

## Complete Script

```powershell
# --- Script to Generate Multiple AL Entities using ALTPGen based on Dataverse Entities ---
# Processes multiple entities in batch by calling Generate-Entity.ps1 for each entity.
# Automatically moves files to src/Table/ and applies BCS prefix.
# To update the entity list, import the latest Solution.xml and use Copilot.
#
# Usage:
#   cd .github\skills\bc-dataverse-entity-generator\scripts
#   .\Generate-Entity-List.ps1

# --- Entity Configuration List ---
# Define Dataverse entities and their corresponding Business Central Table IDs.
# ID Range from app.json: 70000 to 70050 (51 IDs available)
# Format: @{Entity = 'dataverse_entity_schemaname'; BaseId = 70XXX }
$entities = @(
    @{Entity = 'account'; BaseId = 50000 },
    @{Entity = 'quote'; BaseId = 50001 },
    @{Entity = 'quotedetail'; BaseId = 50002 },
    @{Entity = 'salesorder'; BaseId = 50003 },
    @{Entity = 'salesorderdetail'; BaseId = 50004 },
    @{Entity = 'transactioncurrency'; BaseId = 50005 }
)

# --- Object Prefix Configuration ---
# Prefix added to all generated AL object files.
# Common prefixes: BCS (Business Central Scout), CDS, CRM
# Example: BCS + CDSaccount.Table.al → BCSCDSaccount.Table.al
$objectPrefix = "BCS"

# --- Get Script Location ---
$SkillPath = $PSScriptRoot
$BasePath = Split-Path (Split-Path (Split-Path $SkillPath -Parent) -Parent) -Parent

# --- Process Each Entity ---
foreach ($item in $entities) {
    Write-Host "Processing $($item.Entity) with BaseId $($item.BaseId)" -ForegroundColor Cyan
    Set-Location $PSScriptRoot
    & ".\Generate-Entity.ps1" -Entity $item.Entity -BaseId $item.BaseId
}

# --- Post-Processing: Move and Rename Generated Files ---
$sourcePath = Split-Path $PSScriptRoot -Parent
$destinationPath = Join-Path (Split-Path $PSScriptRoot -Parent) "src\Table"

if (-not (Test-Path $destinationPath)) {
    New-Item -ItemType Directory -Path $destinationPath -Force
    Write-Host "Created destination directory: $destinationPath" -ForegroundColor Yellow
}

Get-ChildItem -Path $sourcePath -Filter "*.al" -File |
    Where-Object { $_.DirectoryName -eq $sourcePath } |
    ForEach-Object {
        $newFileName = $objectPrefix + $_.Name
        $newPath = Join-Path $destinationPath $newFileName
        Write-Host "Moving and renaming $($_.Name) to $newFileName..." -ForegroundColor Cyan
        Move-Item -Path $_.FullName -Destination $newPath -Force
        Write-Host "Moved and renamed successfully" -ForegroundColor Green
    }
```

## How to Run

```powershell
# From project root:
Set-Location altpgen
.\Generate-Entity-List.ps1

# Prerequisites:
# - Generate-Entity.ps1 must be configured with correct Dataverse credentials
# - Azure AD App Registration must be set up with proper permissions
# - ALTPGen tool path must be valid in Generate-Entity.ps1
# - User must have read access to Dataverse environment
```
