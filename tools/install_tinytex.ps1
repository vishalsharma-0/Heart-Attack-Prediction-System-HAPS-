$toolsDir = "c:\Users\visha\Downloads\HAPS(final)\tools"
$tinytexZip = Join-Path $toolsDir "tinytex.zip"
$tinytexDir = Join-Path $toolsDir "TinyTeX"

if (-not (Test-Path "$tinytexDir\bin\windows\pdflatex.exe")) {
    Write-Host "Downloading TinyTeX..."
    curl.exe -L "https://github.com/rstudio/tinytex-releases/releases/download/v2026.10/TinyTeX-v2026.10.zip" -o $tinytexZip
    Write-Host "Extracting TinyTeX..."
    Expand-Archive -Path $tinytexZip -DestinationPath $toolsDir -Force
    Remove-Item $tinytexZip -ErrorAction SilentlyContinue
}

if (Test-Path "$tinytexDir\bin\windows\pdflatex.exe") {
    & "$tinytexDir\bin\windows\pdflatex.exe" --version
    & "$tinytexDir\bin\windows\bibtex.exe" --version
}
