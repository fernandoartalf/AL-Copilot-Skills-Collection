# OnPrem Remote Deploy Reference

Use this file for detailed examples that are intentionally kept out of SKILL.md to reduce token usage.

## Trigger File Example

```text
Entorno=Entorno1
Instancia=BC-Entorno1
TsclientBase=\\tsclient\c\Repositorios\MyProject\_deploy_output\Entorno1
RutaRemota=D:\BCDeploy\Entorno1
NavAdminTool=C:\Program Files\Microsoft Dynamics 365 Business Central\220\Service\NavAdminTool.ps1
Apps=MyApp|1.0.0.1|D:\BCDeploy\Entorno1\MyPublisher_MyApp_1.0.0.1.app
```

## Generated Server Deploy Script Pattern

```powershell
$ErrorActionPreference = 'Stop'
. '<NavAdminToolPath>'

$appActual = Get-NAVAppInfo -ServerInstance '<Instance>' -Name '<AppName>' -ErrorAction SilentlyContinue |
    Sort-Object Version -Descending | Select-Object -First 1
if ($appActual) { $vOld = $appActual.Version.ToString() } else { $vOld = $null }

Publish-NAVApp -SkipVerification -ServerInstance '<Instance>' -Path '<RemotePath>'
Sync-NAVApp -ServerInstance '<Instance>' -Name '<AppName>' -Version '<Version>'

if ($vOld -and ($vOld -ne '<Version>')) {
    Start-NAVAppDataUpgrade -ServerInstance '<Instance>' -Name '<AppName>' -Version '<Version>'
    Unpublish-NAVApp -ServerInstance '<Instance>' -Name '<AppName>' -Version $vOld
} else {
    Install-NAVApp -ServerInstance '<Instance>' -Name '<AppName>' -Version '<Version>'
}
```

## Find alc.exe

```powershell
$pattern = Join-Path $env:USERPROFILE ".vscode\extensions\ms-dynamics-smb.al-*\bin\alc.exe"
$alc = Get-ChildItem $pattern -Recurse |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
```

## Compile with Additional Assembly Probing Paths

```powershell
$alcArgs = @(
    "/project:`"$AppDir`"",
    "/packagecachepath:`"$AppDir\.alpackages`"",
    "/out:`"$OutputPath`""
)

foreach ($path in $assemblyPaths) {
    $alcArgs += "/assemblyprobingpaths:`"$path`""
}

if ($ExtraPackageCache) {
    $alcArgs += "/packagecachepath:`"$ExtraPackageCache`""
}

& $alcExe @alcArgs 2>&1
```

## SMB Named Share Example

```powershell
New-Item -ItemType Directory -Path "D:\BCDeploy" -Force
New-SmbShare -Name "BC_DEPLOY" -Path "D:\BCDeploy" -ChangeAccess "Domain\DeveloperUser"
```
