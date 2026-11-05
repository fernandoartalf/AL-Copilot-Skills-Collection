<#
.SYNOPSIS
    Returns the next free table ID inside the app.json idRanges.

.DESCRIPTION
    Scans all .al files under the project for "table <id>" declarations and returns the next ID after the
    highest one already used inside app.json idRanges. Fails if the ranges are exhausted.

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .\Get-NextTableId.ps1 -ProjectPath C:\AL\MyApp
#>
[CmdletBinding()]
param(
    [string]$ProjectPath = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

$appJson = Join-Path $ProjectPath 'app.json'
if (-not (Test-Path $appJson)) { throw "app.json not found in $ProjectPath" }
$ranges = @((Get-Content $appJson -Raw | ConvertFrom-Json).idRanges | Sort-Object from)
if (-not $ranges) { throw "app.json has no idRanges." }

$used = Get-ChildItem -Path $ProjectPath -Filter '*.al' -File -Recurse |
    Where-Object { $_.FullName -notmatch '\\\.(alpackages|snapshots|git)\\' } |
    ForEach-Object {
        foreach ($m in [regex]::Matches((Get-Content $_.FullName -Raw), '(?im)^\s*table\s+(\d+)\s')) {
            [int]$m.Groups[1].Value
        }
    }

$inRange = @($used | Where-Object { $id = $_; @($ranges | Where-Object { $id -ge $_.from -and $id -le $_.to }).Count -gt 0 })
$candidate = if ($inRange.Count) { ($inRange | Measure-Object -Maximum).Maximum + 1 } else { $ranges[0].from }

if (-not ($ranges | Where-Object { $candidate -ge $_.from -and $candidate -le $_.to })) {
    $next = $ranges | Where-Object { $_.from -gt $candidate } | Select-Object -First 1
    if (-not $next) { throw "No free table ID left in app.json idRanges." }
    $candidate = $next.from
}

Write-Output $candidate
