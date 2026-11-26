---
name: bc-dataverse-entity-generator
description: "Generate Business Central AL integration (proxy) tables from Microsoft Dataverse entities with the AL Table Proxy Generator (altpgen). Downloads altpgen from the Microsoft.Dynamics.BusinessCentral.Development.Tools.Altpgen NuGet package into C:\\altpgen when missing, allocates the next free table ID from app.json, runs the bundled Generate-Entity.ps1, moves the result to src/Table with the BCS prefix, merges new fields into existing tables and updates the permission set. Use when the user asks to generate, create, import or regenerate a Dataverse/CDS/CRM entity or table in Business Central, create proxy or integration tables, install or download altpgen, or reports altpgen.exe missing from the AL Language extension."
---

# Business Central Dataverse Entity Generator

Generates AL proxy tables (`TableType = CDS`) from Dataverse entities using **altpgen**, which since AL Language 18.x is no longer bundled with the VS Code extension and is distributed as the NuGet package `Microsoft.Dynamics.BusinessCentral.Development.Tools.Altpgen`.

## Conventions

- `<skill-dir>` = the folder containing this `SKILL.md` (e.g. `.github/skills/bc-dataverse-entity-generator` or `.claude/skills/bc-dataverse-entity-generator`).
- `<project>` = the AL project root (folder with `app.json`). Run commands from there.
- All commands are Windows PowerShell. From a Bash shell (e.g. Claude Code on Windows) wrap them as `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <script> <args>` — this form works in every shell.
- altpgen opens an **interactive Microsoft sign-in**. Run it in a terminal visible to the user and tell them to complete authentication; the command blocks until they do.

## Bundled resources

| Resource | Purpose |
|----------|---------|
| [scripts/Install-Altpgen.ps1](./scripts/Install-Altpgen.ps1) | Downloads the altpgen NuGet package into `C:\altpgen` (idempotent) and prints the matching `altpgen.exe` path on stdout |
| [scripts/Get-NextTableId.ps1](./scripts/Get-NextTableId.ps1) | Returns the next free table ID inside `app.json` `idRanges` |
| [scripts/Generate-Entity.ps1](./scripts/Generate-Entity.ps1) | Runs altpgen for one or more entities; environment values are parameters, altpgen is auto-installed via `Install-Altpgen.ps1` if missing |
| [assets/altpgen.settings.json](./assets/altpgen.settings.json) | Format example of the settings file stored in `C:\altpgen` (normally created by the script, no need to copy it) |
| [references/merge-and-permissions.md](./references/merge-and-permissions.md) | Merging regenerated tables and permission set updates |
| [references/troubleshooting.md](./references/troubleshooting.md) | Error codes (AADSTS50194, CDS0001/CDS0002), runtime and download issues |

## Prerequisites

Confirm before running; ask the user for anything missing:

- Windows with the **.NET 8 or .NET 10 Desktop Runtime** (`dotnet --list-runtimes` → `Microsoft.WindowsDesktop.App 8.x` or `10.x`).
- Internet access to `api.nuget.org` (first run or upgrade).
- **ServiceUri** (Dataverse environment URL, e.g. `https://yourorg.crm4.dynamics.com/`) and **ClientId** (app registration GUID) are stored once in `C:\altpgen\altpgen.settings.json` (see [Settings file](#settings-file)). **Do not ask the user for them** unless that file does not exist, is invalid, or a run fails because of them (script exit code 2, or `AADSTS`/`CDS0001` errors). Never guess them, and never store them in the repository.
- Entra ID app registration: **multi-tenant**, redirect URI `msal<ClientId>://auth` (Mobile and desktop), API permission *Dynamics CRM / user_impersonation*.
- Symbols in `<project>/.alpackages`.

## Settings file

The Dataverse connection values are stored **once, outside the repository**, in the altpgen folder: `C:\altpgen\altpgen.settings.json`.

```json
{
  "serviceUri": "https://yourorg.crm4.dynamics.com/",
  "clientId": "00000000-0000-0000-0000-000000000000"
}
```

- Created automatically: the first successful run with `-ServiceUri` and `-ClientId` saves them (nothing to copy by hand; see [assets/altpgen.settings.json](./assets/altpgen.settings.json) for the format). Optional keys: `redirectUri`, `packageCachePath`.
- Later runs read the file; the user is **not** asked again.
- Preserved when `Install-Altpgen.ps1` upgrades the package. Contains no secrets (sign-in is interactive).
- Ask the user **only** when the file is missing/invalid (script exit code 2, `SETTINGS ERROR`) or altpgen fails with `AADSTS`/`CDS0001` errors. Then re-run with the corrected `-ServiceUri` and `-ClientId`; a successful run overwrites the file.

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Install / update altpgen in C:\altpgen
- [ ] 2. Resolve entity logical name(s)
- [ ] 3. Allocate table ID
- [ ] 4. Run Generate-Entity.ps1
- [ ] 5. Move generated files to src/Table
- [ ] 6. Apply BCS naming
- [ ] 7. Merge with existing table (if any)
- [ ] 8. Update permission set
- [ ] 9. Build and review
```

### Step 1: Install altpgen into C:\altpgen

```powershell
$AltpgenExe = powershell -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>\scripts\Install-Altpgen.ps1"
```

What it does:

1. Resolves the latest **stable** version from `https://api.nuget.org/v3-flatcontainer/microsoft.dynamics.businesscentral.development.tools.altpgen/index.json`.
2. Skips the download if `C:\altpgen\*.nuspec` already has that version; otherwise downloads the `.nupkg` (a zip — no .NET project or `dotnet tool install` needed) and extracts the **whole package content** into `C:\altpgen`.
3. Picks `C:\altpgen\lib\net10.0-windows7.0\altpgen.exe` or `...\net8.0-windows7.0\altpgen.exe` based on the installed .NET Desktop Runtime.
4. Writes only the exe path to stdout (progress goes to stderr).

Options: `-Version <x>` pin a version, `-IncludePrerelease` allow `-beta` builds, `-Framework net8|net10` force a build, `-Force` reinstall, `-Offline` use only what is already installed, `-InstallPath` change the folder (default `C:\altpgen`).

`Generate-Entity.ps1` calls this installer automatically when `-AltpgenPath` is omitted, so running it explicitly is only needed to pin a version/framework or to report the installed version up front.

If the script fails, see [troubleshooting](./references/troubleshooting.md). Do not fall back to the old `.vscode\extensions\ms-dynamics-smb.al-*\bin\win32\altpgen` path unless the user asks.

### Step 2: Resolve the entity logical name

- altpgen's `-entities` value is **case-sensitive** and must be the Dataverse **logical name** (e.g. `account`, `salesorder`, `cr2e6_labbook`). A wrong case fails with `CDS0002`.
- If unsure, look it up in `dataversesolutions/**/Entity.xml` or ask the user.
- Several entities: comma-separate them in one run (`-Entity "account,contact"`; altpgen assigns IDs from `BaseId` upward — make sure enough consecutive IDs are free) or process them one by one.

### Step 3: Allocate the table ID

```powershell
$BaseId = powershell -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>\scripts\Get-NextTableId.ps1" -ProjectPath "<project>"
```

Returns the highest table ID used inside `app.json` `idRanges` + 1 (or the range start if none). Fails when the range is exhausted — then ask the user to extend `idRanges`.

If the entity already has a table (see Step 7), regenerate with a **temporary** free ID and merge instead of creating a duplicate.

### Step 4: Run the generation script

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>\scripts\Generate-Entity.ps1" `
    -Entity <logicalname> -BaseId $BaseId -ProjectPath "<project>"
```

`ServiceUri` and `ClientId` are read from the [settings file](#settings-file); pass `-ServiceUri "<uri>" -ClientId "<guid>"` only when the file is missing/invalid or the values must change (they are saved after a successful run).

| Parameter | Required | Default |
|-----------|----------|---------|
| `-Entity` | yes | — (logical name, comma-separated for several) |
| `-BaseId` | yes | — (from Step 3) |
| `-ServiceUri` | first run | `C:\altpgen\altpgen.settings.json` → `serviceUri` |
| `-ClientId` | first run | `C:\altpgen\altpgen.settings.json` → `clientId` (must be a GUID) |
| `-ConfigPath` | no | `<AltpgenRoot>\altpgen.settings.json` |
| `-ProjectPath` | no | current directory (must contain `app.json`) |
| `-RedirectUri` | no | `msal<ClientId>://auth` |
| `-PackageCachePath` | no | `<project>\.alpackages` |
| `-AltpgenPath` | no | resolved/installed via `Install-Altpgen.ps1` in `-AltpgenRoot` |
| `-AltpgenRoot` | no | `C:\altpgen` |
| `-NoInstall` | no | never download; fail if altpgen is not in `-AltpgenRoot` |

The script validates inputs, then runs:

```
altpgen -project:<project> -packagecachepath:<project>\.alpackages -serviceuri:<ServiceUri>
        -entities:<logicalname> -baseid:<BaseId> -tabletype:CDS -clientid:<ClientId> -redirecturi:msal<ClientId>://auth
```

Exit codes: `0` success; `2` `SETTINGS ERROR` (missing/invalid ServiceUri/ClientId — ask the user); `1` any other failure (`Error: ...` on stderr). Any `error CDS....` or `AADSTS...` line → [troubleshooting](./references/troubleshooting.md).

Do not use or create a project-level `altpgen/Generate-Entity.ps1` for this skill; the bundled script is the single source.

### Step 5: Move generated files

altpgen writes `*.Table.al` next to the project (project root, sometimes `src\`). Move only the files created by this run:

```powershell
$since = (Get-Date).AddMinutes(-10)
Get-ChildItem "<project>", "<project>\src" -Filter '*.Table.al' -File |
    Where-Object { $_.LastWriteTime -gt $since } |
    Move-Item -Destination "<project>\src\Table" -PassThru
```

Create `src\Table` if it does not exist. Move any generated pages/codeunits to `src\Page` / `src\Codeunit`.

### Step 6: Apply BCS naming

| Item | Generated | Target |
|------|-----------|--------|
| File | `CDSaccount.Table.al` | `BCSCDSAccount.Table.al` |
| Object | `table 70008 "CDS account"` | `table 70008 "BCS CDS Account"` |

Edit the table declaration (PascalCase the entity part), rename the file, and update any references. Object names must stay ≤ 30 characters — shorten if needed and tell the user. Follow the repo AL naming instructions if present.

### Step 7: Merge with an existing table

If `src/Table` already contains `"BCS CDS <Entity>"`, do **not** keep a second table: merge new fields (match on `ExternalName`) into the existing one, preserve custom code, delete the generated copy. Details and decision table: [merge-and-permissions.md](./references/merge-and-permissions.md).

### Step 8: Update the permission set

Add to the project permission set (skip if already present):

```al
tabledata "BCS CDS Account" = RIMD,
table "BCS CDS Account" = X
```

Mind the trailing `,` / `;`. See [merge-and-permissions.md](./references/merge-and-permissions.md).

### Step 9: Build and review

- Build with whatever the environment offers: Copilot `al_build` tool, VS Code **AL: Package** (`Ctrl+Shift+B`), or ask the user to build.
- Fix diagnostics (IDs out of range, name length, missing symbols).
- Review `ExternalName`, `TableRelation`, `DataClassification` and option fields.

## Report to the user

Summarize:

```
✅ Generated "BCS CDS Account" (table 70008) from Dataverse entity 'account'
   altpgen: C:\altpgen\lib\net10.0-windows7.0\altpgen.exe (package 18.1.43.24897)
   File:    src/Table/BCSCDSAccount.Table.al
   Merge:   new table | merged N fields into existing table
   Perms:   AGENTDEMO.permissionset.al updated
   Build:   succeeded | N errors (listed)
Next: create a CDS list page, integration mapping and synchronization setup.
```

## Common entities

| Logical name | AL table name |
|--------------|---------------|
| account | BCS CDS Account |
| contact | BCS CDS Contact |
| lead | BCS CDS Lead |
| opportunity | BCS CDS Opportunity |
| quote / quotedetail | BCS CDS Quote / BCS CDS Quote Detail |
| salesorder / salesorderdetail | BCS CDS Sales Order / BCS CDS Sales Order Detail |
| invoice | BCS CDS Invoice |
| product | BCS CDS Product |
| pricelevel | BCS CDS Price Level |
| transactioncurrency | BCS CDS Transaction Currency |
| systemuser / team | BCS CDS System User / BCS CDS Team |

## Rules

- Never hardcode or invent table IDs — always use `Get-NextTableId.ps1`.
- Never commit secrets; `ClientId` and `ServiceUri` are configuration, not secrets, but do not add client secrets.
- Do not leave generated files in the project root.
- Reuse `C:\altpgen`; only reinstall with `-Force` or when a newer version is needed.

## Related skills

`bc-cds-page-generator` (list page for the new table), `bc-dataverse-mapping-generator` (integration mapping), `dataverse-solution-importer` / `dataverse-schema-generator` (entity logical names).
