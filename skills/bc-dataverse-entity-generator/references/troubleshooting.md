# Troubleshooting

## Contents

- [altpgen.exe not found](#altpgenexe-not-found)
- [No matching .NET Desktop Runtime](#no-matching-net-desktop-runtime)
- [Download from nuget.org fails](#download-from-nugetorg-fails)
- [AADSTS50194 – app is not multi-tenant](#aadsts50194--app-is-not-multi-tenant)
- [CDS0002 – unable to retrieve metadata](#cds0002--unable-to-retrieve-metadata)
- [Authentication timeout or denied](#authentication-timeout-or-denied)
- [Files not generated](#files-not-generated)
- [Table ID conflict](#table-id-conflict)
- [Permission set syntax error](#permission-set-syntax-error)
- [Duplicate fields after merge](#duplicate-fields-after-merge)

## altpgen.exe not found

Since AL Language extension 18.x, `altpgen.exe` is **not** in `%USERPROFILE%\.vscode\extensions\ms-dynamics-smb.al-*\bin\win32\altpgen` anymore. It ships in the NuGet package `Microsoft.Dynamics.BusinessCentral.Development.Tools.Altpgen`.

Fix: run `scripts/Install-Altpgen.ps1` (extracts into `C:\altpgen`), or download the `.nupkg` manually from <https://www.nuget.org/packages/Microsoft.Dynamics.BusinessCentral.Development.Tools.Altpgen>, rename to `.zip` and extract into `C:\altpgen`. Then pass `-AltpgenPath` to `Generate-Entity.ps1` or let it auto-resolve from `C:\altpgen\lib`.

## No matching .NET Desktop Runtime

The package has `lib\net8.0-windows7.0` and `lib\net10.0-windows7.0`. Each requires the matching **Microsoft.WindowsDesktop.App** runtime (major versions do not roll forward).

```powershell
dotnet --list-runtimes
winget install Microsoft.DotNet.DesktopRuntime.10   # or .8
```

Force a build with `Install-Altpgen.ps1 -Framework net8|net10`.

## Download from nuget.org fails

- Check proxy/firewall access to `api.nuget.org`.
- If an older version is already in `C:\altpgen`, the installer falls back to it with a warning.
- Pin a version with `-Version <x.y.z.w>`; list versions at `https://api.nuget.org/v3-flatcontainer/microsoft.dynamics.businesscentral.development.tools.altpgen/index.json`.
- Writing to `C:\` normally works for standard users; if denied, use `-InstallPath` with a writable folder and pass the resulting exe to `Generate-Entity.ps1 -AltpgenPath`.

## AADSTS50194 – app is not multi-tenant

`Application '<id>' is not configured as a multi-tenant application. Usage of the /common endpoint is not supported...`

Fix: Azure Portal → App registrations → *Authentication* → *Supported account types* → **Accounts in any organizational directory (multi-tenant)**. Redirect URI (Mobile and desktop) must be `msal<ClientId>://auth`; API permission `Dynamics CRM / user_impersonation`.

## CDS0002 – unable to retrieve metadata

`Could not find an entity with name cr2e6_LabBook...`

The `-entities` value is **case-sensitive** and must be the Dataverse *logical name* (usually all lowercase, e.g. `cr2e6_labbook`). Check `dataversesolutions/**/Entity.xml` or the maker portal.

## Authentication timeout or denied

1. The sign-in window opens on the user's desktop — the command must run in a terminal the user can see.
2. Verify the user has access to the Dataverse environment and `$ServiceUri` is correct.
3. Re-run after fixing the app registration.

## Files not generated

1. Verify the entity logical name (see CDS0002).
2. Read the altpgen console output for `error CDS....` lines.
3. Ensure `.alpackages` contains symbols (download symbols first).
4. Look in both the project root and `src\` — altpgen writes next to the project.

## Table ID conflict

Re-run `scripts/Get-NextTableId.ps1`, check uncommitted files, and confirm the ID is inside `app.json` `idRanges`.

## Permission set syntax error

Each entry ends with `,` except the last (`;`). Table names must be quoted and match exactly. See [merge-and-permissions.md](merge-and-permissions.md).

## Duplicate fields after merge

Match by `ExternalName`, renumber colliding fields, remove duplicates, rebuild. If heavily diverged, regenerate and re-apply customizations.
