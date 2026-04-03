# Generate-Entity.ps1 — Full Script Reference

The single-entity generation script. Located at `.github/skills/bc-dataverse-entity-generator/scripts/Generate-Entity.ps1`.

## Sensitive Variables

These variables store environment-specific or secret configuration. **Never commit real values to source control.**

| Variable | Type | Description |
|----------|------|-------------|
| `$ServiceUri` | **ENVIRONMENT** | Dataverse environment URL. Find in Power Platform Admin Center > Environments > Environment URL |
| `$ClientId` | **SECRET** | Azure AD App Registration Application (client) ID. Found in Azure Portal > App registrations |
| `$RedirectUri` | **SECRET** | MSAL redirect URI. Must match Azure AD App Registration > Authentication > Redirect URIs |
| `$AltpgenPath` | **ENVIRONMENT** | Local path to ALTPGen executable. Depends on installed AL extension version |

## Complete Script

```powershell
# --- Script to Generate AL Entities using ALTPGen based on the Dataverse Entities ---
# Usage:
#   cd .github\skills\bc-dataverse-entity-generator\scripts
#   .\Generate-Entity.ps1 -Entity account -BaseId 70004
#
# Prerequisites:
# - Administrator permissions on both Dataverse and Business Central environments
# - Azure AD App Registration with Dynamics CRM > user_impersonation permission
# - ALTPGen tool installed via AL Language extension
# Reference: https://yzhums.com/17065/

param(
    [Parameter(Mandatory = $true)]
    [string]$Entity,

    [Parameter(Mandatory = $true)]
    [int]$BaseId
)

# --- Variables ---
$SkillPath = $PSScriptRoot
$BasePath = Split-Path (Split-Path (Split-Path $SkillPath -Parent) -Parent) -Parent
$ProjectPath = "$BasePath"
$PackageCachePath = "$BasePath\.alpackages"

# ⚠️ SENSITIVE: Dataverse Service URI
# The URL of your Dataverse environment.
# Format: https://<your-org-name>.crm[X].dynamics.com/
# Regional examples:
#   North America: https://yourorg.crm.dynamics.com/
#   Europe:        https://yourorg.crm4.dynamics.com/
#   UK:            https://yourorg.crm11.dynamics.com/
#   Asia Pacific:  https://yourorg.crm5.dynamics.com/
#   Canada:        https://yourorg.crm3.dynamics.com/
#   Australia:     https://yourorg.crm6.dynamics.com/
$ServiceUri = "https://contoso.crm.dynamics.com/"

# ⚠️ SENSITIVE: Azure AD Application (Client) ID
# Steps to create:
# 1. Azure Portal > Azure Active Directory > App registrations > New registration
# 2. Grant API permissions: Dynamics CRM > user_impersonation
# 3. Copy "Application (client) ID" (GUID format)
$ClientId = "12345678-1234-1234-1234-123456789abc"

# ⚠️ SENSITIVE: Redirect URI (derived from ClientId)
# Configure in Azure Portal:
# 1. App Registration > Authentication > Add platform > Mobile and desktop applications
# 2. Add custom redirect URI: msal<your-client-id>://auth
$RedirectUri = "msal${ClientId}://auth"

# ⚠️ ENVIRONMENT-SPECIFIC: ALTPGen Tool Path
# Depends on installed AL Language extension version.
# Find your version: VSCode > Extensions > Search "AL Language" > check version
# Path pattern: C:\Users\<User>\.vscode\extensions\ms-dynamics-smb.al-<version>\bin\win32\altpgen\altpgen.exe
$AltpgenPath = "C:\Users\JohnDoe\.vscode\extensions\ms-dynamics-smb.al-17.0.1869541\bin\win32\altpgen\altpgen.exe"

try {
    if (-not (Test-Path $ProjectPath)) {
        throw "Project path not found: $ProjectPath"
    }

    if (-not (Test-Path $AltpgenPath)) {
        throw "ALTPGen tool not found: $AltpgenPath"
    }

    $AltpgenDir = Split-Path $AltpgenPath
    Set-Location $AltpgenDir

    Write-Host "Running ALTPGen for entity '$Entity' with BaseId $BaseId..." -ForegroundColor Cyan

    & .\altpgen `
        -project:$ProjectPath `
        -packagecachepath:$PackageCachePath `
        -serviceuri:$ServiceUri `
        -entities:$Entity `
        -baseid:$BaseId `
        -tabletype:CDS `
        -clientid:$ClientId `
        -redirecturi:$RedirectUri

    if ($LASTEXITCODE -eq 0) {
        Write-Host "ALTPGen completed successfully ✅" -ForegroundColor Green
    }
    else {
        throw "ALTPGen exited with code $LASTEXITCODE ❌"
    }
}
catch {
    Write-Error "Error: $_"
    exit 1
}
```

## How to Find Your ALTPGen Path

```powershell
# Auto-detect installed AL extension
$alExtension = Get-ChildItem "$env:USERPROFILE\.vscode\extensions" -Filter "ms-dynamics-smb.al-*" | 
    Sort-Object Name -Descending | Select-Object -First 1
$altpgenPath = Join-Path $alExtension.FullName "bin\win32\altpgen\altpgen.exe"
Write-Host "ALTPGen path: $altpgenPath"
```
