@echo off
echo Starting LitWise Application...
echo.

echo Starting Python Backend Server...
start "Python Backend" cmd /k "cd /d %~dp0 && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
echo Python backend started. Waiting 45 seconds for it to initialize...
timeout /t 45 /nobreak >nul

echo.
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd /d %~dp0 && npm run dev"
echo Next.js frontend started.

echo.
echo Waiting 3 seconds for frontend to start, then opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Both servers are now running:
echo - Python Backend: http://localhost:8000
echo - Next.js Frontend: http://localhost:3000
echo.
echo Browser should now be open to the application.
echo Press any key to close this window...
pause >nul 