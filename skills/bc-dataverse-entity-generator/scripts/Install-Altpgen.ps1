<#
.SYNOPSIS
    Downloads the AL Table Proxy Generator (altpgen) NuGet package and extracts it into C:\altpgen.

.DESCRIPTION
    Since AL Language extension 18.x, altpgen.exe is no longer shipped inside the VS Code extension.
    It is distributed in the NuGet package Microsoft.Dynamics.BusinessCentral.Development.Tools.Altpgen.
    No .NET project or "dotnet tool install" is required: the .nupkg is a ZIP file that is downloaded
    from nuget.org and extracted as-is into the install folder.

    The package contains lib\net8.0-windows7.0 and lib\net10.0-windows7.0, each with altpgen.exe.
    The script selects the build that matches an installed .NET Desktop Runtime (Microsoft.WindowsDesktop.App)
    and writes the full path of altpgen.exe to the pipeline as its only output.

.PARAMETER InstallPath
    Destination folder. Default: C:\altpgen

.PARAMETER Version
    Exact package version to install. Default: latest stable (or latest prerelease with -IncludePrerelease).

.PARAMETER IncludePrerelease
    Consider -beta versions when resolving the latest version.

.PARAMETER Framework
    Force a target framework folder: net8 or net10. Default: auto-detect from installed .NET Desktop Runtimes.

.PARAMETER Force
    Re-download and re-extract even if the requested version is already installed.

.PARAMETER Offline
    Do not contact nuget.org: use the version already in InstallPath, or fail if none is installed.

.EXAMPLE
    $exe = powershell -NoProfile -ExecutionPolicy Bypass -File .\Install-Altpgen.ps1
.EXAMPLE
    .\Install-Altpgen.ps1 -Version 30.0.44.47290-beta -Force
#>
[CmdletBinding()]
param(
    [string]$InstallPath = 'C:\altpgen',
    [string]$Version,
    [switch]$IncludePrerelease,
    [ValidateSet('net8', 'net10')]
    [string]$Framework,
    [switch]$Force,
    [switch]$Offline
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$PackageId = 'microsoft.dynamics.businesscentral.development.tools.altpgen'
$FeedBase = "https://api.nuget.org/v3-flatcontainer/$PackageId"

# Progress goes to stderr so stdout only carries the altpgen.exe path (safe for $exe = powershell -File ...)
function Write-Log([string]$Message) {
    [Console]::Error.WriteLine($Message)
}

function Get-InstalledPackageVersion([string]$Path) {
    $nuspec = Get-ChildItem -Path $Path -Filter '*.nuspec' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $nuspec) { return $null }
    return ([xml](Get-Content $nuspec.FullName -Raw)).package.metadata.version
}

function Resolve-PackageVersion {
    if ($Version) { return $Version }
    $all = (Invoke-RestMethod -Uri "$FeedBase/index.json" -UseBasicParsing).versions
    $candidates = if ($IncludePrerelease) { $all } else { $all | Where-Object { $_ -notmatch '-' } }
    if (-not $candidates) { throw "No matching versions of $PackageId found on nuget.org." }
    return $candidates |
        Sort-Object { [version]($_ -replace '-.*$', '') }, { $_ -notmatch '-' } |
        Select-Object -Last 1
}

function Get-DesktopRuntimeMajors {
    $roots = @()
    if ($env:DOTNET_ROOT) { $roots += $env:DOTNET_ROOT }
    $roots += Join-Path $env:ProgramFiles 'dotnet'
    $majors = foreach ($root in $roots) {
        $dir = Join-Path $root 'shared\Microsoft.WindowsDesktop.App'
        if (Test-Path $dir) {
            Get-ChildItem $dir -Directory | ForEach-Object {
                if ($_.Name -match '^(\d+)\.') { [int]$Matches[1] }
            }
        }
    }
    return @($majors | Sort-Object -Unique -Descending)
}

function Select-AltpgenExe([string]$Path) {
    $builds = Get-ChildItem -Path (Join-Path $Path 'lib') -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^net(\d+)\.' -and (Test-Path (Join-Path $_.FullName 'altpgen.exe')) } |
        ForEach-Object { [pscustomobject]@{ Major = [int]($_.Name -replace '^net(\d+)\..*$', '$1'); Dir = $_.FullName } } |
        Sort-Object Major -Descending
    if (-not $builds) { throw "altpgen.exe not found under $Path\lib." }

    if ($Framework) {
        $wanted = [int]($Framework -replace 'net', '')
        $build = $builds | Where-Object Major -eq $wanted | Select-Object -First 1
        if (-not $build) { throw "Package has no $Framework build. Available: net$($builds.Major -join ', net')" }
        return Join-Path $build.Dir 'altpgen.exe'
    }

    $runtimes = Get-DesktopRuntimeMajors
    $build = $builds | Where-Object { $runtimes -contains $_.Major } | Select-Object -First 1
    if (-not $build) {
        throw ("No installed .NET Desktop Runtime matches the altpgen builds (net$($builds.Major -join ', net')). " +
            "Installed WindowsDesktop runtimes: $(if ($runtimes) { $runtimes -join ', ' } else { 'none' }). " +
            "Install one, e.g. 'winget install Microsoft.DotNet.DesktopRuntime.10' or 'winget install Microsoft.DotNet.DesktopRuntime.8'.")
    }
    return Join-Path $build.Dir 'altpgen.exe'
}

$installed = Get-InstalledPackageVersion $InstallPath

if ($Offline) {
    if (-not $installed) { throw "-Offline specified but no altpgen package is installed in $InstallPath." }
    $exe = Select-AltpgenExe $InstallPath
    Write-Log "Using installed altpgen $installed (offline): $exe"
    Write-Output $exe
    return
}

try {
    $target = Resolve-PackageVersion
}
catch {
    if ($installed) {
        Write-Warning "Could not query nuget.org ($($_.Exception.Message)). Using installed version $installed."
        $target = $installed
    }
    else { throw }
}

if ($installed -eq $target -and -not $Force) {
    Write-Log "altpgen $installed already installed in $InstallPath"
}
else {
    $tempDir = Join-Path ([IO.Path]::GetTempPath()) ("altpgen-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    try {
        # Expand-Archive in Windows PowerShell 5.1 only accepts the .zip extension
        $lowerVersion = $target.ToLowerInvariant()
        $zip = Join-Path $tempDir "$PackageId.$lowerVersion.zip"
        $url = "$FeedBase/$lowerVersion/$PackageId.$lowerVersion.nupkg"
        Write-Log "Downloading $PackageId $target from nuget.org..."
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

        if (Test-Path $InstallPath) {
            # Keep the user's settings file when replacing an older package version
            Get-ChildItem -Path $InstallPath -Force | Where-Object Name -ne 'altpgen.settings.json' | Remove-Item -Recurse -Force
        }
        else {
            New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        }
        Expand-Archive -Path $zip -DestinationPath $InstallPath -Force
        Write-Log "Extracted package into $InstallPath"
    }
    finally {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

$exe = Select-AltpgenExe $InstallPath
Write-Log "Using altpgen: $exe"
Write-Output $exe
