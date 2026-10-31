$toolsDir = "c:\Users\visha\Downloads\HAPS(final)\tools"
$popplerZip = Join-Path $toolsDir "poppler.zip"
$popplerDir = Join-Path $toolsDir "poppler"

if (-not (Test-Path "$popplerDir\bin\pdffonts.exe")) {
    Write-Host "Downloading Poppler..."
    curl.exe -L "https://github.com/oschwartz10612/poppler-windows/releases/download/v26.09.0-0/Release-26.09.0-0.zip" -o $popplerZip
    Write-Host "Extracting Poppler..."
    Expand-Archive -Path $popplerZip -DestinationPath $toolsDir -Force
    # Rename extracted directory if needed
    $extracted = Get-ChildItem -Path $toolsDir -Directory -Filter "poppler-*" | Select-Object -First 1
    if ($extracted) {
        Rename-Item -Path $extracted.FullName -NewName "poppler" -Force
    }
    Remove-Item $popplerZip -ErrorAction SilentlyContinue
}

& "$popplerDir\bin\pdffonts.exe" -v
& "$popplerDir\bin\pdftoppm.exe" -v
