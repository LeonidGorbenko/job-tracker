@echo off
setlocal

set "SOURCE=C:\proj\job-tracker"
set "FRONTEND=%SOURCE%\frontend"
set "BACKEND=%SOURCE%\backend"
set "TARGET=C:\proj\job-tracker-deploy"

echo Preparing clean deployment staging folder...
echo Source: %SOURCE%
echo Target: %TARGET%
echo.

if exist "%TARGET%" (
  echo Removing existing staging folder...
  rmdir /s /q "%TARGET%"
  if errorlevel 1 (
    echo Failed to remove existing staging folder.
    exit /b 1
  )
)

mkdir "%TARGET%"
if errorlevel 1 (
  echo Failed to create staging folder.
  exit /b 1
)

mkdir "%TARGET%\frontend"
if errorlevel 1 exit /b 1

echo Copying frontend runtime and build files...
copy /y "%FRONTEND%\package.json" "%TARGET%\frontend" >nul
if errorlevel 1 exit /b 1
copy /y "%FRONTEND%\package-lock.json" "%TARGET%\frontend" >nul
if errorlevel 1 exit /b 1
copy /y "%FRONTEND%\index.html" "%TARGET%\frontend" >nul
if errorlevel 1 exit /b 1
copy /y "%FRONTEND%\vite.config.js" "%TARGET%\frontend" >nul
if errorlevel 1 exit /b 1
copy /y "%FRONTEND%\eslint.config.js" "%TARGET%\frontend" >nul
if errorlevel 1 exit /b 1
copy /y "%FRONTEND%\.env.example" "%TARGET%\frontend" >nul
if errorlevel 1 exit /b 1

echo Copying optional frontend build config files if present...
for %%F in (
  postcss.config.js
  postcss.config.cjs
  postcss.config.mjs
  tailwind.config.js
  tailwind.config.cjs
  tailwind.config.mjs
) do (
  if exist "%FRONTEND%\%%F" (
    copy /y "%FRONTEND%\%%F" "%TARGET%\frontend" >nul
    if errorlevel 1 exit /b 1
  )
)

echo Copying frontend source...
robocopy "%FRONTEND%\src" "%TARGET%\frontend\src" /E /XD node_modules .git .vscode .agents .codex dist /XF .env .env.* *.log *.tmp *.temp >nul
set "ROBOCOPY_EXIT=%ERRORLEVEL%"
if %ROBOCOPY_EXIT% GEQ 8 (
  echo Failed to copy frontend source.
  exit /b %ROBOCOPY_EXIT%
)

if exist "%FRONTEND%\public" (
  echo Copying frontend public folder...
  robocopy "%FRONTEND%\public" "%TARGET%\frontend\public" /E /XD node_modules .git .vscode .agents .codex dist /XF .env .env.* *.log *.tmp *.temp >nul
  set "ROBOCOPY_EXIT=%ERRORLEVEL%"
  if %ROBOCOPY_EXIT% GEQ 8 (
    echo Failed to copy frontend public folder.
    exit /b %ROBOCOPY_EXIT%
  )
) else (
  echo Frontend public folder not found. Creating empty staging public folder...
  mkdir "%TARGET%\frontend\public"
  if errorlevel 1 exit /b 1
)

echo Copying backend runtime files...
mkdir "%TARGET%\backend"
if errorlevel 1 exit /b 1

copy /y "%BACKEND%\package.json" "%TARGET%\backend" >nul
if errorlevel 1 exit /b 1
copy /y "%BACKEND%\package-lock.json" "%TARGET%\backend" >nul
if errorlevel 1 exit /b 1
copy /y "%BACKEND%\.env.example" "%TARGET%\backend" >nul
if errorlevel 1 exit /b 1

robocopy "%BACKEND%\src" "%TARGET%\backend\src" /E /XD node_modules .git .vscode .agents .codex dist /XF .env .env.* *.log *.tmp *.temp >nul
set "ROBOCOPY_EXIT=%ERRORLEVEL%"
if %ROBOCOPY_EXIT% GEQ 8 (
  echo Failed to copy backend source.
  exit /b %ROBOCOPY_EXIT%
)

robocopy "%BACKEND%\sql" "%TARGET%\backend\sql" /E /XD node_modules .git .vscode .agents .codex dist /XF .env .env.* *.log *.tmp *.temp >nul
set "ROBOCOPY_EXIT=%ERRORLEVEL%"
if %ROBOCOPY_EXIT% GEQ 8 (
  echo Failed to copy backend SQL files.
  exit /b %ROBOCOPY_EXIT%
)

robocopy "%BACKEND%\scripts" "%TARGET%\backend\scripts" /E /XD node_modules .git .vscode .agents .codex dist /XF .env .env.* *.log *.tmp *.temp >nul
set "ROBOCOPY_EXIT=%ERRORLEVEL%"
if %ROBOCOPY_EXIT% GEQ 8 (
  echo Failed to copy backend scripts.
  exit /b %ROBOCOPY_EXIT%
)

echo.
echo Deployment staging folder prepared.
echo Created: %TARGET%
echo.
echo Included:
echo - frontend package files and build config
echo - frontend .env.example
echo - frontend src\
echo - frontend public\
echo - backend package files
echo - backend .env.example
echo - backend src\
echo - backend sql\
echo - backend scripts\
echo.
echo Excluded:
echo - node_modules
echo - dist
echo - .git
echo - .env files with real secrets
echo - documentation and AI planning files
echo - editor files, logs, and temporary files

exit /b 0
