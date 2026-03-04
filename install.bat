@echo off
rem ─────────────────────────────────────────────────────────────────────────────
rem SalesSaathi — One-command installer (Windows)
rem Usage:  Double-click install.bat  OR  run it from Command Prompt
rem ─────────────────────────────────────────────────────────────────────────────

title SalesSaathi Installer
color 0A

echo.
echo  =============================================================
echo   SalesSaathi ^| Open-Source MSME CRM ^| Windows Installer
echo  =============================================================
echo.

rem ── 1. Python ──────────────────────────────────────────────────────────────
echo [1/6] Checking Python 3.8+...
python --version >nul 2>&1
if errorlevel 1 (
  echo   ERROR: Python not found.
  echo   Please install Python 3.8 or newer from https://python.org
  echo   Make sure to check "Add Python to PATH" during installation.
  pause
  exit /b 1
)
for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PY_VER=%%v
echo   OK: Python %PY_VER% found.

rem ── 2. Virtual environment ──────────────────────────────────────────────────
echo [2/6] Creating virtual environment...
if not exist "venv" (
  python -m venv venv
  echo   OK: Virtual environment created.
) else (
  echo   OK: Virtual environment already exists.
)
call venv\Scripts\activate.bat

rem ── 3. Backend packages ─────────────────────────────────────────────────────
echo [3/6] Installing backend packages...
pip install --quiet --upgrade pip
pip install --quiet -r backend\requirements.txt
echo   OK: Backend packages installed.

rem ── 4. Node.js check ───────────────────────────────────────────────────────
echo [4/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
  echo   ERROR: Node.js not found.
  echo   Please install Node.js 18+ from https://nodejs.org
  pause
  exit /b 1
)
for /f %%v in ('node --version') do set NODE_VER=%%v
echo   OK: Node.js %NODE_VER% found.

rem ── 5. Frontend packages ────────────────────────────────────────────────────
echo [5/6] Installing frontend packages...
cd frontend
call npm install --silent
echo   OK: Frontend packages installed.
call npm run build --silent
echo   OK: Frontend built.
cd ..

rem ── 6. Data directory and .env ─────────────────────────────────────────────
echo [6/6] Setting up data directory...
if not exist "data" mkdir data
if not exist ".env" (
  copy .env.example .env >nul
  echo   OK: .env file created.
) else (
  echo   OK: .env already exists.
)

rem ── Write start.bat ─────────────────────────────────────────────────────────
(
echo @echo off
echo title SalesSaathi
echo call venv\Scripts\activate.bat
echo echo.
echo echo   Starting SalesSaathi...
echo echo   App will open at: http://localhost:3000
echo echo   Press Ctrl+C to stop.
echo echo.
echo start "SalesSaathi Backend" cmd /c "cd backend ^&^& python app.py"
echo timeout /t 2 /nobreak ^>nul
echo start http://localhost:3000
echo cd frontend ^&^& npx vite preview --port 3000
) > start.bat

echo.
echo  =============================================================
echo   Installation complete!
echo  =============================================================
echo.
echo   To start SalesSaathi:
echo     Double-click  start.bat
echo   OR run:
echo     start.bat
echo.
echo   The app will open at: http://localhost:3000
echo   The first-run wizard will guide you through setup.
echo.
pause
