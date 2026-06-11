@echo off
setlocal

echo ============================================================
echo  gnu-gesta — Lancement de l'application
echo ============================================================
echo.

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..\..\

:: Verifier que les dependances sont installees
if not exist "%PROJECT_ROOT%backend\node_modules" (
    echo [ERREUR] Les dependances backend ne sont pas installees.
    echo Lancez d'abord install.bat
    pause
    exit /b 1
)
if not exist "%PROJECT_ROOT%frontend\node_modules" (
    echo [ERREUR] Les dependances frontend ne sont pas installees.
    echo Lancez d'abord install.bat
    pause
    exit /b 1
)

echo Demarrage du backend  sur http://localhost:3000
echo Demarrage du frontend sur http://localhost:5173
echo.
echo Fermez cette fenetre pour arreter les deux serveurs.
echo ============================================================
echo.

:: Lancer le backend dans une nouvelle fenetre
start "gnu-gesta backend" cmd /k "cd /d "%PROJECT_ROOT%backend" && npm run dev"

:: Attendre une seconde que le backend demarre
timeout /t 2 /nobreak >nul

:: Lancer le frontend dans une nouvelle fenetre
start "gnu-gesta frontend" cmd /k "cd /d "%PROJECT_ROOT%frontend" && npm run dev"

echo Les deux serveurs sont en cours de demarrage dans des fenetres separees.
echo.
echo Backend  : http://localhost:3000/api/health
echo Frontend : http://localhost:5173
echo.
pause
