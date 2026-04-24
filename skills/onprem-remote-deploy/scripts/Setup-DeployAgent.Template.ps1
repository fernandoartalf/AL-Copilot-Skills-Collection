#Requires -RunAsAdministrator

param(
    [string]$DeployBasePath = 'D:\BCDeploy',
    [string[]]$Environments = @('Entorno1', 'Entorno2'),
    [string[]]$RepoNames = @('Al_MyProject'),
    [string]$TaskUser = "$env:USERDOMAIN\$env:USERNAME",
    [string]$TaskName = 'BC-DeployAgent'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $DeployBasePath)) {
    New-Item -ItemType Directory -Path $DeployBasePath | Out-Null
}

foreach ($envName in $Environments) {
    $envPath = Join-Path $DeployBasePath $envName
    if (-not (Test-Path $envPath)) {
        New-Item -ItemType Directory -Path $envPath | Out-Null
    }
}

$agentScript = @"
`$ErrorActionPreference = 'SilentlyContinue'
`$environments = @('Entorno1', 'Entorno2')
`$repoNames = @('Al_MyProject')

foreach (`$entorno in `$environments) {
    foreach (`$drive in @('c','d','e','f')) {
        `$root = "\\tsclient\`$drive"
        if (-not (Test-Path `$root -ErrorAction SilentlyContinue)) { continue }

        foreach (`$repoName in `$repoNames) {
            `$candidates = @(
                "`$root\Repositorios\`$repoName\_deploy_output\`$entorno",
                "`$root\repos\`$repoName\_deploy_output\`$entorno",
                "`$root\dev\`$repoName\_deploy_output\`$entorno",
                "`$root\src\`$repoName\_deploy_output\`$entorno"
            )

            foreach (`$deployDir in `$candidates) {
                `$triggerFile = "`$deployDir\_DEPLOY_TRIGGER.txt"
                if (-not (Test-Path `$triggerFile -ErrorAction SilentlyContinue)) { continue }

                `$resultFile = "`$deployDir\_DEPLOY_RESULT.txt"
                `$logFile = "`$deployDir\_DEPLOY_LOG.txt"

                `$meta = @{}
                Get-Content `$triggerFile | ForEach-Object {
                    `$kv = `$_ -split '=', 2
                    if (`$kv.Count -eq 2) { `$meta[`$kv[0].Trim()] = `$kv[1].Trim() }
                }

                `$instance = `$meta['Instancia']
                `$remotePath = `$meta['RutaRemota']
                if (-not `$instance -or -not `$remotePath) { continue }

                Remove-Item `$triggerFile -Force -ErrorAction SilentlyContinue
                "[`$(Get-Date)] Deploy started for `$entorno from `$deployDir" | Set-Content `$logFile -Encoding UTF8

                try {
                    if (-not (Test-Path `$remotePath)) {
                        New-Item -ItemType Directory -Path `$remotePath | Out-Null
                    }

                    Get-ChildItem "`$deployDir\*.app" -ErrorAction SilentlyContinue | ForEach-Object {
                        Copy-Item `$_.FullName -Destination `$remotePath -Force
                        "Copied app file: `$(`$_.Name)" | Add-Content `$logFile -Encoding UTF8
                    }

                    "OK" | Set-Content `$resultFile -Encoding UTF8
                    "[`$(Get-Date)] Deploy finished successfully" | Add-Content `$logFile -Encoding UTF8
                } catch {
                    "ERROR: `$_" | Set-Content `$resultFile -Encoding UTF8
                    "ERROR: `$_" | Add-Content `$logFile -Encoding UTF8
                }
            }
        }
    }
}
"@

$agentPath = Join-Path $DeployBasePath '_DeployAgent.ps1'
[System.IO.File]::WriteAllText($agentPath, $agentScript, [System.Text.UTF8Encoding]::new($false))

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File `"$agentPath`""
$triggerAtLogon = New-ScheduledTaskTrigger -AtLogOn -User $TaskUser
$triggerRepeat = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 1) -Once -At (Get-Date).Date
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal -UserId $TaskUser -RunLevel Highest -LogonType Interactive

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger @($triggerAtLogon, $triggerRepeat) -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "Setup completed. Agent path: $agentPath" -ForegroundColor Green
Write-Host "Scheduled task created: $TaskName" -ForegroundColor Green
