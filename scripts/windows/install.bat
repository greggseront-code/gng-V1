@echo off
setlocal

echo ============================================================
echo  gnu-gesta — Installation des dependances
echo ============================================================
echo.

:: Verifier que Node.js est installe
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH.
    echo Telecharger Node.js sur https://nodejs.org puis relancer ce script.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js detecte : %NODE_VERSION%
echo.

:: Chemin du script : on remonte de deux niveaux pour atteindre la racine du projet
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..\..\

:: Installation backend
echo [1/2] Installation des dependances backend...
cd /d "%PROJECT_ROOT%backend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] npm install a echoue pour le backend.
    pause
    exit /b 1
)
echo [OK] Backend installe.
echo.

:: Installation frontend
echo [2/2] Installation des dependances frontend...
cd /d "%PROJECT_ROOT%frontend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] npm install a echoue pour le frontend.
    pause
    exit /b 1
)
echo [OK] Frontend installe.
echo.

echo ============================================================
echo  Installation terminee.
echo  Lancez run.bat pour demarrer l'application.
echo ============================================================
pause
