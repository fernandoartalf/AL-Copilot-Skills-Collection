---
name: onprem-remote-deploy
description: "AL app deployment to remote Business Central OnPrem servers. Use when deploying .app files from VS Code to a BC server via WinRM, SSH, SMB, or RDP tsclient-pull when network access is restricted."
---

# Skill: Deploy to BC OnPrem

## Purpose

Deploy AL extension `.app` files from a local VS Code workspace to a remote Business Central OnPrem server. This skill covers multiple deployment strategies ranked by network access level, from fully blocked (tsclient-pull via RDP) to fully open (WinRM/SSH).

## When to Load

This skill should be loaded when:
- A developer needs to publish `.app` files to a remote BC OnPrem server
- WinRM, SSH, or SMB access to the server is blocked or restricted
- A deploy automation script needs to be created or adapted
- The developer has RDP access to the server but no remote PowerShell access
- A deploy agent or scheduled task needs to be configured on a BC server

## Architecture Overview

### The Problem

Deploying AL extensions to BC OnPrem requires running `Publish-NAVApp`, `Sync-NAVApp`, and `Start-NAVAppDataUpgrade` **on the server**. When the developer's PC cannot reach the server via WinRM (5985), SSH (22), or SMB admin shares (445/d$), traditional push-based deploys fail.

### Decision Matrix: Choose Your Strategy

Ask the user these diagnostic questions and select the strategy:

| Question | How to Test |
|---|---|
| Can you reach port 5985 (WinRM)? | `Test-NetConnection -ComputerName <SERVER> -Port 5985` |
| Can you reach port 22 (SSH)? | `Test-NetConnection -ComputerName <SERVER> -Port 22` |
| Can you reach port 445 (SMB)? | `Test-NetConnection -ComputerName <SERVER> -Port 445` |
| Can you access `\\SERVER\d$`? | `Test-Path "\\<SERVER>\d$"` |
| Are you in the same domain? | `(Get-WmiObject Win32_ComputerSystem).Domain` |
| Do you have RDP access? | User knows this |

| Scenario | Strategy | Section |
|---|---|---|
| WinRM open (5985) + same domain | **Strategy A: WinRM Direct** | Simplest, no agent needed |
| SSH open (22) | **Strategy B: SSH Direct** | Needs OpenSSH on server |
| SMB open (445) + admin share or named share works | **Strategy C: SMB Push + Remote Trigger** | Good if auth works |
| Only RDP access, all other ports blocked | **Strategy D: tsclient-pull (RDP Agent)** | Works with zero network access |
| None of the above | **Strategy E: Manual Deploy** | Fallback |

---

## Strategy A: WinRM Direct (Best Case)

**Requirements**: Port 5985 open, same domain or trusted domain, WinRM enabled on server.

### Prerequisites (ask server admin)

```powershell
# ON THE SERVER (as admin):
Enable-PSRemoting -Force
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force   # or specific IPs
```

### Deploy Script Pattern

```powershell
param(
    [string]$ServerName,
    [string]$ServerInstance,
    [string]$AppPath,          # local .app file
    [string]$RemotePath,       # path on server to copy to
    [PSCredential]$Credential
)

# 1. Copy .app to server via SMB
$session = New-PSSession -ComputerName $ServerName -Credential $Credential
Copy-Item $AppPath -Destination $RemotePath -ToSession $session

# 2. Execute BC admin commands remotely
Invoke-Command -Session $session -ScriptBlock {
    param($inst, $appPath, $appName, $appVersion, $forceSync)
    Import-Module 'C:\Program Files\Microsoft Dynamics 365 Business Central\*\Service\NavAdminTool.ps1' -DisableNameChecking

    Publish-NAVApp -SkipVerification -ServerInstance $inst -Path $appPath

    if ($forceSync) {
        Sync-NAVApp -ServerInstance $inst -Name $appName -Version $appVersion -Mode ForceSync -Force
    } else {
        Sync-NAVApp -ServerInstance $inst -Name $appName -Version $appVersion
    }

    $current = Get-NAVAppInfo -ServerInstance $inst -Name $appName | 
        Where-Object { $_.Version.ToString() -ne $appVersion } | 
        Sort-Object Version -Descending | Select-Object -First 1
    
    if ($current) {
        Start-NAVAppDataUpgrade -ServerInstance $inst -Name $appName -Version $appVersion
        Unpublish-NAVApp -ServerInstance $inst -Name $appName -Version $current.Version
    } else {
        Install-NAVApp -ServerInstance $inst -Name $appName -Version $appVersion
    }
} -ArgumentList $ServerInstance, $RemotePath, $AppName, $AppVersion, $ForceSync

Remove-PSSession $session
```

### Admin Request Template

> We need to enable WinRM on server `<SERVER>` to deploy Business Central extensions remotely from VS Code.
> Please run these commands as administrator on the server:
> ```
> Enable-PSRemoting -Force
> ```
> Required inbound port: **5985/TCP** from the developer network.

---

## Strategy B: SSH Direct

**Requirements**: Port 22 open, OpenSSH Server installed on the BC server.

### Prerequisites (ask server admin)

```powershell
# ON THE SERVER (as admin):
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

### Deploy Script Pattern

```powershell
param(
    [string]$ServerName,
    [string]$User,            # domain\user
    [string]$ServerInstance,
    [string]$LocalAppPath,
    [string]$RemoteAppDir
)

# 1. Copy .app via SCP
$remotePath = "${User}@${ServerName}:${RemoteAppDir}"
scp $LocalAppPath $remotePath

# 2. Execute BC commands via SSH
$appFile = Split-Path $LocalAppPath -Leaf
$remoteFullPath = "$RemoteAppDir\$appFile"

ssh "${User}@${ServerName}" "powershell -ExecutionPolicy Bypass -Command `"
    Import-Module 'C:\Program Files\Microsoft Dynamics 365 Business Central\*\Service\NavAdminTool.ps1' -DisableNameChecking;
    Publish-NAVApp -SkipVerification -ServerInstance '$ServerInstance' -Path '$remoteFullPath';
    Sync-NAVApp -ServerInstance '$ServerInstance' -Name '$AppName' -Version '$AppVersion';
    Start-NAVAppDataUpgrade -ServerInstance '$ServerInstance' -Name '$AppName' -Version '$AppVersion'
`""
```

### Admin Request Template

> We need to enable SSH on server `<SERVER>` to deploy Business Central extensions.
> Please run these commands as administrator:
> ```
> Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
> Start-Service sshd
> Set-Service -Name sshd -StartupType Automatic
> ```
> Required inbound port: **22/TCP** from the developer network.

---

## Strategy C: SMB Push + Remote Trigger

**Requirements**: Port 445 open, SMB authentication works (same domain or NTLM accepted).

### Diagnostic: Why SMB Might Fail

| Symptom | Cause | Solution |
|---|---|---|
| `Test-Path` hangs forever | PC in WORKGROUP, server in domain → NTLM auth hangs | Use Strategy D |
| Error 64 "red no disponible" | Admin shares (`d$`) blocked by GPO | Create a named share |
| Error 5 "acceso denegado" | No permissions on share | Ask admin to grant FullControl |
| Works with `net use` but not `Test-Path` | Credential caching issue | Map drive first: `net use Z: \\server\share /user:domain\user` |

### Create Named Share (on server)

```powershell
# ON THE SERVER (as admin):
New-Item -ItemType Directory -Path "D:\BCDeploy" -Force
New-SmbShare -Name "BC_DEPLOY" -Path "D:\BCDeploy" -ChangeAccess "Domain\DeveloperUser"
```

### Deploy Pattern

1. Copy compiled `.app` to `\\SERVER\BC_DEPLOY\<Entorno>\` via SMB
2. Copy a trigger script to the same share
3. A scheduled task on the server detects the trigger and runs the deploy

This is a hybrid of push (files) and pull (execution). If SMB works for files but not for WinRM, this is the best option.

---

## Strategy D: tsclient-pull (RDP Agent) — Zero Network Access

**This is the strategy for when EVERYTHING is blocked.** Only requires RDP access with drive redirection.

### How It Works

```
┌─────────────────┐                    ┌─────────────────┐
│   Developer PC   │     RDP + drives   │    BC Server     │
│                  │ ──────────────────> │                  │
│ VS Code          │                    │ Scheduled Task   │
│ Deploy script    │                    │ _DeployAgent.ps1 │
│                  │                    │                  │
│ _deploy_output/  │ <── tsclient ───── │ reads trigger    │
│   TRIGGER.txt    │                    │ copies .app      │
│   *.app          │                    │ runs deploy      │
│   RESULT.txt     │ <── writes back ── │ writes result    │
└─────────────────┘                    └─────────────────┘
```

**Flow:**
1. VS Code compiles `.app` files locally → `_deploy_output/<Entorno>/`
2. Creates `_DEPLOY_TRIGGER.txt` with metadata
3. Polls for `_DEPLOY_RESULT.txt` every 5 seconds
4. Developer connects to server via RDP **with drive redirection enabled**
5. Server agent (scheduled task, runs every 1 min) scans `\\tsclient\c\...\_deploy_output\` for trigger
6. Agent reads trigger, copies `.app` from tsclient to server local disk
7. Agent executes `Publish → Sync → DataUpgrade → Unpublish`
8. Agent writes `OK` or `ERROR` to `_DEPLOY_RESULT.txt` via tsclient
9. VS Code sees the result → shows **LISTO!**

### RDP Drive Redirection Setup

The developer MUST connect to the server with drive redirection enabled:

**Windows Remote Desktop (mstsc.exe):**
1. Open mstsc → "Show Options" / "Mostrar opciones"
2. Tab "Local Resources" / "Recursos locales"
3. Click "More..." / "Más..."
4. Check "Drives" / "Unidades" ✓
5. Connect

**Remote Desktop Manager (RDM):**
1. Right-click connection → Edit / Properties
2. Section "Local Resources" → "Drives" → Enable ✓
3. Save and reconnect

**Royal TS / mRemoteNG / other RDP clients:**
Similar option under Local Resources → Drive Redirection.

### One-Time Setup: Server Agent

Use the reusable script template in `scripts/Setup-DeployAgent.Template.ps1`.

- It uses generic paths and environment names (`Entorno1`, `Entorno2`).
- All script output messages are in English.
- It creates a scheduled task and an agent script without project-specific names.

For full examples and optional variants, read `references/onprem-remote-deploy-reference.md`.

### Deploy Script (runs on developer PC)

The deploy script on the developer PC performs these steps:

1. **Find alc.exe** — searches `~/.vscode/extensions/ms-dynamics-smb.al-*/bin/alc.exe`
2. **Bump version** — increments 4th component in `app.json` (e.g., `22.0.8.180` → `22.0.8.181`)
3. **Compile** — runs `alc.exe /project:<AppDir> /packagecachepath:<cache> /out:<output>`
4. **Generate server script** — creates `_RunDeploy_<Entorno>.ps1` with Publish → Sync → DataUpgrade → Unpublish
5. **Write trigger** — creates `_DEPLOY_TRIGGER.txt` with metadata (instance, paths, apps)
6. **Poll for result** — checks `_DEPLOY_RESULT.txt` every 5 seconds, up to 15 minutes

**Key parameters:**
- `-Entorno Entorno1|Entorno2` — target environment
- `-SoloAppBase` — deploy only base app, skip secondary apps
- `-ForzarSync` — use `Sync-NAVApp -Mode ForceSync -Force` (DANGEROUS: can cause data loss)

**Trigger format and generated deploy script examples:**

See `references/onprem-remote-deploy-reference.md` for:
- Trigger file schema (`_DEPLOY_TRIGGER.txt`)
- Generated server script pattern (`_RunDeploy_<Entorno>.ps1`)
- Generic sample values without customer-specific naming

---

## Compilation: alc.exe Patterns

### Finding and running alc.exe

Use the compact patterns in `references/onprem-remote-deploy-reference.md`:
- Discover latest `alc.exe` from AL extension folder
- Build argument arrays with multiple `/assemblyprobingpaths`
- Add extra package cache for dependent apps

---

## Sync Modes: When to Use What

| Mode | Command | Use When | Risk |
|---|---|---|---|
| **Normal** (default) | `Sync-NAVApp -ServerInstance $inst -Name $name -Version $ver` | Routine deploys, no breaking schema changes | None — fails safely if incompatible |
| **ForceSync** | `Sync-NAVApp ... -Mode ForceSync -Force` | Broken environment, schema pending, destructive schema changes | **Can delete table data** if fields are removed |

### When the Environment is Broken

Error example (localized): environment requires schema synchronization.

**Diagnosis:**
```powershell
Get-NAVTenant -ServerInstance '<Instance>' | Format-Table Id, State
# If State = "OperationalWithSyncPending" → needs Sync-NAVTenant
```

**Fix:**
```powershell
Sync-NAVTenant -ServerInstance '<Instance>' -Mode ForceSync -Force
```

### Version Downgrade Error

Error: `"Cannot synchronize extension X because a newer version has already been synchronized"`

**Cause:** Server has version N+1, you're trying to deploy version N.

**Fix:** Bump local version higher than server version, then deploy normally.

---

## Troubleshooting

### Common Errors and Solutions

| Error | Cause | Fix |
|---|---|---|
| `OperationalWithSyncPending` | Sync failed mid-deploy | `Sync-NAVTenant -Mode ForceSync -Force` |
| `newer version has already been synchronized` | Local version < server version | Bump local version above server |
| `Cannot upgrade because version must be newer` | DataUpgrade with same or lower version | Bump version, don't downgrade |
| Trigger not detected by agent | Drive redirection not enabled in RDP | Enable "Drives" in RDP Local Resources |
| `Test-Path \\server\share` hangs forever | PC in WORKGROUP, server in domain | Use Strategy D (tsclient-pull) |
| Agent runs but `_DEPLOY_RESULT.txt` never appears | Scheduled task not running | Check Task Scheduler, verify user and logon trigger |
| `.Trim()` on null | Result file is empty when read | Add null check: `if ($raw) { $result = $raw.Trim() }` |

### Diagnostic Commands (run on server)

```powershell
# Check all installed apps
Get-NAVAppInfo -ServerInstance '<Instance>' | Sort-Object Name, Version | Format-Table Name, Version, Status -AutoSize

# Check tenant state
Get-NAVTenant -ServerInstance '<Instance>' | Format-Table Id, State

# Check scheduled task
Get-ScheduledTask -TaskName "BC-DeployAgent" | Format-List TaskName, State, LastRunTime, LastTaskResult

# Check if tsclient drives are visible
Test-Path "\\tsclient\c" 
Get-ChildItem "\\tsclient\c" -ErrorAction SilentlyContinue
```

---

## Customization Checklist

When adapting these scripts for a new project, update:

| Setting | Where | Example |
|---|---|---|
| `$ServerInstance` / `$Instancia` | Deploy script param | `BC-Entorno1` |
| `$environments` | Setup agent script | `@('Entorno1', 'Entorno2', 'PROD')` |
| `$deployBasePath` | Setup agent script | `D:\BCDeploy` |
| `$repoNames` | Agent script | `@('Al_MyProject', 'Al_OtherProject')` |
| `$taskUser` | Setup agent script | `DOMAIN\Username` |
| NavAdminTool path | Deploy script config | `C:\Program Files\Microsoft Dynamics 365 Business Central\220\Service\NavAdminTool.ps1` |
| ValidateSet for `-Entorno` | Deploy script param | `'Entorno1', 'Entorno2', 'PROD'` |
| App publisher name | Filename pattern | `MyPublisher` |
| `candidatos` paths in agent | Agent script | Add your common repo locations |

---

## Security Notes

- **Never** use `-Mode ForceSync` on production without explicit approval — it can delete data from removed table fields
- The scheduled task runs as the logged-in user with **Highest** privileges — ensure this is a dedicated service account or trusted admin user
- Drive redirection (`tsclient`) is only available during an active RDP session — files are NOT accessible when disconnected
- The agent does NOT store credentials — it runs in the context of the interactive logon session
- `.app` files are copied to a local folder on the server before being published — clean up old `.app` files periodically

---

## References and Scripts

- `references/onprem-remote-deploy-reference.md`: extended examples, trigger schema, and command snippets.
- `scripts/Setup-DeployAgent.Template.ps1`: reusable setup script with generic names and English output messages.
