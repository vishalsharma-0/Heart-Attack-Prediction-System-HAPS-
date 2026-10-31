# Heart Attack Prediction System (HAPS) - Local Windows Startup Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting Heart Attack Prediction System (HAPS)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start PostgreSQL (port 5433)
Write-Host "[1/4] Checking PostgreSQL cluster on port 5433..." -ForegroundColor Yellow
$pgPort = Get-NetTCPConnection -LocalPort 5433 -ErrorAction SilentlyContinue
if (-not $pgPort) {
    Write-Host "Starting local PostgreSQL server..." -ForegroundColor Green
    Start-Process -FilePath "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -ArgumentList "-D", "`"$root\postgres_data`"" -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "PostgreSQL is already running on port 5433." -ForegroundColor Green
}

# 2. Start FastAPI ML Service (port 8000)
Write-Host "[2/4] Starting FastAPI ML Inference Service (port 8000)..." -ForegroundColor Yellow
$mlPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $mlPort) {
    Start-Process -FilePath "$root\ml\.venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "src.service.app:app", "--host", "0.0.0.0", "--port", "8000" -WorkingDirectory "$root\ml" -WindowStyle Minimized
    Start-Sleep -Seconds 3
} else {
    Write-Host "FastAPI ML service is already running on port 8000." -ForegroundColor Green
}

# 3. Start Spring Boot API Gateway (port 8080)
Write-Host "[3/4] Starting Spring Boot REST Backend (port 8080)..." -ForegroundColor Yellow
$bePort = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if (-not $bePort) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "$root\backend\mvnw.cmd spring-boot:run" -WorkingDirectory "$root\backend" -WindowStyle Minimized
    Start-Sleep -Seconds 5
} else {
    Write-Host "Spring Boot backend is already running on port 8080." -ForegroundColor Green
}

# 4. Start React Frontend (port 5173)
Write-Host "[4/4] Starting React Frontend (port 5173)..." -ForegroundColor Yellow
$fePort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if (-not $fePort) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -WorkingDirectory "$root\frontend" -WindowStyle Minimized
    Start-Sleep -Seconds 2
} else {
    Write-Host "React frontend is already running on port 5173." -ForegroundColor Green
}

Write-Host "`nAll HAPS services launched successfully!" -ForegroundColor Green
Write-Host "Frontend Dashboard : http://localhost:5173" -ForegroundColor Cyan
Write-Host "Spring Boot Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "FastAPI Docs       : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Database (Postgres): localhost:5433 (database: haps)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Start-Process "http://localhost:5173"
