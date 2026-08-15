# HeatGuard AI Server Starter
# Run this script to start both frontend and backend servers

Write-Host "Starting HeatGuard AI servers..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Start backend server in a new window
Start-Process -WindowStyle Normal -FilePath "cmd.exe" -ArgumentList "/k cd backend && python -m uvicorn main:app --reload --port 8000"

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start frontend server in a new window
Start-Process -WindowStyle Normal -FilePath "cmd.exe" -ArgumentList "/k cd frontend && npm run dev"

Write-Host "Both servers are starting..." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
