# --- Script to Generate AL Entities using ALTPGen based on the Dataverse Entities---
# To run the script, use the following command:
# reference the path where the script is located
#2- .\Generate-Entity.ps1 -Entity account -BaseId 50100
# Run the script with the desired entity name and Business Central Table ID
# note: the script will create new AL files, if you want to update an schema, create the new object and paste the fields on the existing object.
# The script will generate the AL files for the specified entity on the src folder, please move it to the table folder and save it so it uses the BCS prefix.
# To run the command correctly the user must have administrator permissions on both Dataverse and Business Central environments and we must use an App registration (and inform it on the ClientId and RedirectUri).
# For more technical information about the dataverse integration customization, visit: https://yzhums.com/17065/
param(
    [Parameter(Mandatory = $true)]
    [string]$Entity,

    [Parameter(Mandatory = $true)]
    [int]$BaseId
)

# --- Variables ---
$SkillPath = $PSScriptRoot
$BasePath = Split-Path (Split-Path (Split-Path (Split-Path $SkillPath -Parent) -Parent) -Parent) -Parent
$ProjectPath = "$BasePath"
$PackageCachePath = "$BasePath\.alpackages"

# ============================================================================
# CONFIGURATION: SENSITIVE VARIABLES
# ============================================================================
# The following variables contain environment-specific and sensitive data.
# Update these values before first use. DO NOT commit sensitive values to Git.
# ============================================================================

# --- ENVIRONMENT VARIABLE: Dataverse Service URI ---
# TYPE: Environment-specific configuration (not secret, but environment-dependent)
# PURPOSE: Target Dataverse environment URL for entity retrieval
# HOW TO FIND: Power Platform Admin Center > Environments > Select environment > Environment URL
# FORMAT: https://<org-name>.crm[region-code].dynamics.com/
# REGIONS: .crm (NA), .crm4 (EU), .crm11 (UK), .crm5 (APAC), .crm3 (CA), .crm6 (AU)
# EXAMPLE: "https://contoso.crm.dynamics.com/"
# ⚠️ UPDATE THIS: Set to your Dataverse environment URL
$ServiceUri = "https://contoso.crm.dynamics.com/"

# --- SENSITIVE VARIABLE: Azure AD Application (Client) ID ---
# TYPE: Secret - OAuth client identifier
# PURPOSE: Authenticates to Dataverse via Azure AD App Registration
# HOW TO FIND: Azure Portal > App Registrations > Select app > Overview > Application (client) ID
# FORMAT: GUID (8-4-4-4-12 format)
# REQUIRED PERMISSIONS: Dynamics CRM > user_impersonation (Delegated)
# EXAMPLE: "12345678-1234-1234-1234-123456789abc"
# ⚠️ SENSITIVE: Do not commit actual values to public repositories
# ⚠️ UPDATE THIS: Set to your Azure AD App Registration client ID
$ClientId = "12345678-1234-1234-1234-123456789abc"

# --- SENSITIVE VARIABLE: Redirect URI ---
# TYPE: Secret - OAuth redirect configuration
# PURPOSE: OAuth authentication callback for MSAL (Microsoft Authentication Library)
# FORMAT: msal{ClientId}://auth
# HOW TO CONFIGURE: Azure Portal > App Registration > Authentication > Mobile/desktop > Add URI
# AUTO-GENERATED: This value is derived from $ClientId above
# EXAMPLE: "msal12345678-1234-1234-1234-123456789abc://auth"
# ⚠️ SENSITIVE: Must match exactly what's configured in Azure AD
$RedirectUri = "msal${ClientId}://auth"

# --- ENVIRONMENT VARIABLE: ALTPGen Tool Path ---
# TYPE: Environment-specific configuration (local system path)
# PURPOSE: Path to ALTPGen.exe for generating AL table definitions from Dataverse
# HOW TO FIND: VSCode > Extensions > "AL Language" > Check version
# PATH PATTERN: C:\Users\{User}\.vscode\extensions\ms-dynamics-smb.al-{version}\bin\win32\altpgen\altpgen.exe
# EXAMPLE: "C:\Users\JohnDoe\.vscode\extensions\ms-dynamics-smb.al-17.0.1869541\bin\win32\altpgen\altpgen.exe"
# ⚠️ VERSION-SPECIFIC: Path changes when AL extension updates
# ⚠️ UPDATE THIS: Set to your local ALTPGen.exe path
# 💡 TIP: The agent can auto-detect and fix this path if incorrect
$AltpgenPath = "C:\Users\JohnDoe\.vscode\extensions\ms-dynamics-smb.al-17.0.1869541\bin\win32\altpgen\altpgen.exe"

# ============================================================================
# END CONFIGURATION
# ============================================================================

try {
    # --- Check Project Directory ---
    if (-not (Test-Path $ProjectPath)) {
        throw "Project path not found: $ProjectPath"
    }

    # --- Check ALTPGen Path ---
    if (-not (Test-Path $AltpgenPath)) {
        throw "ALTPGen tool not found: $AltpgenPath"
    }

    # --- Move to altpgen directory ---
    $AltpgenDir = Split-Path $AltpgenPath
    Set-Location $AltpgenDir

    Write-Host "Running ALTPGen for entity '$Entity' with BaseId $BaseId..." -ForegroundColor Cyan

    # --- Run ALTPGen ---
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
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Generated file is in project root" -ForegroundColor White
        Write-Host "2. File will be moved to src/Table/ with CDS prefix" -ForegroundColor White
        Write-Host "3. Update permission set if needed" -ForegroundColor White
    }
    else {
        throw "ALTPGen exited with code $LASTEXITCODE ❌"
    }
}
catch {
    Write-Error "Error: $_"
    exit 1
}
# To Update the Autogenerated Comment Block Below, import the latest Solution.xml from the dataverse Solution and Use Copilot agent with the following prompt:
# read the full file of solution.xml and create comments at the end of the generate-entity.ps1 file based on "#.\Generate-Entity.ps1 -Entity account -BaseId 50100". Replace the "acount" by the schemaName of all the roorcomponents with type 1 and the 50100 by increasing that number by 1 on each element
# --- End of Script ---
# -Script Call Example----------
#.\Generate-Entity.ps1 -Entity account -BaseId 50100
# --------------------

# -----------------------------------------------------------------------------
# Auto-generated comment block based on solution.xml RootComponents (type=1)
# Each line is a commented example to run this script for the corresponding
# Dataverse entity (schemaName) using an incrementing BaseId starting at 50100.
# -----------------------------------------------------------------------------
# .\Generate-Entity.ps1 -Entity account -BaseId 50100
