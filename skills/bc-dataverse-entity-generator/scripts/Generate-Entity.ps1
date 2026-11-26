<#
.SYNOPSIS
    Generates Business Central AL proxy tables (TableType = CDS) from Dataverse entities with altpgen.

.DESCRIPTION
    Portable version of altpgen/Generate-Entity.ps1 bundled with the bc-dataverse-entity-generator skill.
    Environment-specific values are passed as parameters, so it works in any AL project.

    altpgen.exe is resolved in this order:
      1. -AltpgenPath
      2. <AltpgenRoot>\lib\net*-windows*\altpgen.exe (default C:\altpgen), matching an installed .NET Desktop Runtime
      3. Install-Altpgen.ps1 (same folder) downloads the NuGet package into <AltpgenRoot> (skip with -NoInstall)

    altpgen opens an interactive Microsoft sign-in; the script blocks until the user authenticates.
    Generated *.Table.al files are written to the project folder.

.PARAMETER Entity
    Dataverse logical name(s), case-sensitive. Comma-separate to generate several (e.g. "account,contact").

.PARAMETER BaseId
    First table ID to use. altpgen increments it for each additional table.

.PARAMETER ServiceUri
    Dataverse environment URL, e.g. https://yourorg.crm4.dynamics.com/
    If omitted, read from the settings file (see -ConfigPath).

.PARAMETER ClientId
    Application (client) ID of a multi-tenant Entra ID app registration with Dynamics CRM user_impersonation.
    If omitted, read from the settings file (see -ConfigPath).

.PARAMETER ConfigPath
    JSON settings file with serviceUri and clientId (optional: redirectUri, packageCachePath).
    Default: <AltpgenRoot>\altpgen.settings.json (i.e. C:\altpgen\altpgen.settings.json, outside the repository).
    Command-line values override the file. When ServiceUri/ClientId are passed on the command line and altpgen
    completes successfully, they are saved to this file so they are not requested again.
    If the file is missing or invalid and no values are passed, the script exits with code 2.

.PARAMETER RedirectUri
    Default: msal<ClientId>://auth (must be registered as a Mobile and desktop redirect URI).

.PARAMETER ProjectPath
    AL project folder (contains app.json). Default: current directory.

.PARAMETER PackageCachePath
    Symbol folder. Default: <ProjectPath>\.alpackages

.PARAMETER NoInstall
    Never download: use only an existing altpgen in <AltpgenRoot>; fail if it is missing.

.EXAMPLE
    .\Generate-Entity.ps1 -Entity account -BaseId 70000 -ProjectPath C:\AL\MyApp
.EXAMPLE
    # First run (or to replace stored values): values are saved to C:\altpgen\altpgen.settings.json after success
    .\Generate-Entity.ps1 -Entity account -BaseId 70000 -ServiceUri https://yourorg.crm4.dynamics.com/ -ClientId 00000000-0000-0000-0000-000000000000 -ProjectPath C:\AL\MyApp
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Entity,

    [Parameter(Mandatory = $true)]
    [int]$BaseId,

    [string]$ServiceUri,

    [string]$ClientId,

    [string]$ConfigPath,

    [string]$RedirectUri,

    [string]$ProjectPath = (Get-Location).Path,

    [string]$PackageCachePath,

    [string]$AltpgenPath,

    [string]$AltpgenRoot = 'C:\altpgen',

    [switch]$NoInstall
)

$ErrorActionPreference = 'Stop'

class SettingsException : System.Exception {
    SettingsException([string]$message) : base($message) {}
}

try {
    $ProjectPath = (Resolve-Path $ProjectPath).Path
    if (-not (Test-Path (Join-Path $ProjectPath 'app.json'))) {
        throw "app.json not found in project path: $ProjectPath"
    }

    if (-not $ConfigPath) { $ConfigPath = Join-Path $AltpgenRoot 'altpgen.settings.json' }

    # Values passed explicitly are saved after a successful run; values taken from the file are not rewritten
    $saveSettings = [bool]($ServiceUri -and $ClientId)
    $cfg = $null
    if (Test-Path $ConfigPath) {
        try { $cfg = Get-Content $ConfigPath -Raw | ConvertFrom-Json }
        catch { if (-not $saveSettings) { throw [SettingsException]::new("Settings file $ConfigPath is not valid JSON: $($_.Exception.Message)") } }
    }
    if ($cfg) {
        if (-not $ServiceUri -and $cfg.serviceUri) { $ServiceUri = $cfg.serviceUri }
        if (-not $ClientId -and $cfg.clientId) { $ClientId = $cfg.clientId }
        if (-not $RedirectUri -and $cfg.redirectUri) { $RedirectUri = $cfg.redirectUri }
        if (-not $PackageCachePath -and $cfg.packageCachePath) { $PackageCachePath = $cfg.packageCachePath }
        Write-Host "Settings loaded from $ConfigPath"
    }
    if (-not $ServiceUri -or -not $ClientId) {
        throw [SettingsException]::new("ServiceUri and ClientId not available: $ConfigPath is missing or incomplete. Ask the user for them and re-run with -ServiceUri and -ClientId (they will be saved).")
    }

    if (-not $PackageCachePath) { $PackageCachePath = Join-Path $ProjectPath '.alpackages' }
    if (-not (Test-Path $PackageCachePath)) {
        Write-Warning "Package cache not found: $PackageCachePath. Download symbols first if altpgen reports missing symbols."
    }

    if ($ServiceUri -notmatch '^https://[^/]+\.dynamics\.com/?$') {
        throw [SettingsException]::new("ServiceUri '$ServiceUri' is not a Dataverse URL like https://<org>.crm[N].dynamics.com/")
    }
    if (-not $ServiceUri.EndsWith('/')) { $ServiceUri += '/' }

    $parsedClientId = [guid]::Empty
    if (-not [guid]::TryParse($ClientId, [ref]$parsedClientId)) {
        throw [SettingsException]::new("ClientId '$ClientId' is not a GUID.")
    }
    if (-not $RedirectUri) { $RedirectUri = "msal${ClientId}://auth" }

    if (-not $AltpgenPath) {
        $installer = Join-Path $PSScriptRoot 'Install-Altpgen.ps1'
        # The installer is idempotent: it only downloads when the folder is empty or outdated,
        # and always returns the build matching the installed .NET Desktop Runtime.
        $AltpgenPath = @(& $installer -InstallPath $AltpgenRoot -Offline:$NoInstall)[-1]
    }
    if (-not (Test-Path $AltpgenPath)) {
        throw "altpgen.exe not found: $AltpgenPath"
    }

    Write-Host "Running altpgen for entity '$Entity' with BaseId $BaseId..." -ForegroundColor Cyan
    Write-Host "  altpgen:  $AltpgenPath"
    Write-Host "  project:  $ProjectPath"
    Write-Host "  service:  $ServiceUri"
    Write-Host "Complete the Microsoft sign-in when the authentication window opens." -ForegroundColor Yellow

    Push-Location (Split-Path $AltpgenPath)
    try {
        & $AltpgenPath `
            "-project:$ProjectPath" `
            "-packagecachepath:$PackageCachePath" `
            "-serviceuri:$ServiceUri" `
            "-entities:$Entity" `
            "-baseid:$BaseId" `
            '-tabletype:CDS' `
            "-clientid:$ClientId" `
            "-redirecturi:$RedirectUri"
        $altpgenExit = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    if ($altpgenExit -ne 0) {
        throw "altpgen exited with code $altpgenExit. If the output shows AADSTS/CDS0001 (authentication or connection) errors, the stored ServiceUri/ClientId may be wrong: confirm them with the user and re-run with -ServiceUri and -ClientId."
    }
    Write-Host "altpgen completed successfully" -ForegroundColor Green

    if ($saveSettings) {
        $toSave = [ordered]@{ serviceUri = $ServiceUri; clientId = $ClientId }
        if ($cfg -and $cfg.redirectUri) { $toSave.redirectUri = $cfg.redirectUri }
        if ($cfg -and $cfg.packageCachePath) { $toSave.packageCachePath = $cfg.packageCachePath }
        New-Item -ItemType Directory -Path (Split-Path $ConfigPath) -Force | Out-Null
        $toSave | ConvertTo-Json | Set-Content -Path $ConfigPath -Encoding UTF8
        Write-Host "Settings saved to $ConfigPath"
    }
}
catch [SettingsException] {
    [Console]::Error.WriteLine("SETTINGS ERROR: $($_.Exception.Message)")
    exit 2
}
catch {
    [Console]::Error.WriteLine("Error: $_")
    exit 1
}
