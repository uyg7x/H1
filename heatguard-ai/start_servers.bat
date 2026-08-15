@echo off
chcp 65001 >nul
echo Starting HeatGuard AI servers...
echo ========================================

:: Start backend server
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

:: Wait a bit for backend to start
timeout /t 5 /nobreak >nul

:: Start frontend server
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause
