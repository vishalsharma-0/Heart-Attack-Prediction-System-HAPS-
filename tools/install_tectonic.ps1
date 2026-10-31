$toolsDir = "c:\Users\visha\Downloads\HAPS(final)\tools"
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

$tectonicZip = Join-Path $toolsDir "tectonic.zip"
$tectonicExe = Join-Path $toolsDir "tectonic.exe"

if (-not (Test-Path $tectonicExe)) {
    Write-Host "Downloading Tectonic..."
    curl.exe -L "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic@0.17.0/tectonic-0.17.0-x86_64-pc-windows-msvc.zip" -o $tectonicZip
    Write-Host "Extracting Tectonic..."
    Expand-Archive -Path $tectonicZip -DestinationPath $toolsDir -Force
    Remove-Item $tectonicZip -ErrorAction SilentlyContinue
}

& $tectonicExe --version
