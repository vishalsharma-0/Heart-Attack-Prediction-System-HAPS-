# Stop all HAPS services
Write-Host "Stopping HAPS microservices..." -ForegroundColor Yellow

$ports = @(5173, 8080, 8000, 5433)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns.OwningProcess | Select-Object -Unique
        foreach ($p in $pids) {
            Write-Host "Terminating process $p on port $port..." -ForegroundColor Cyan
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "All HAPS processes stopped." -ForegroundColor Green
