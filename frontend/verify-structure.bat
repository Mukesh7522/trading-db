@echo off
REM verify-structure.bat
REM Save this in: C:\Users\mukesh\Documents\stock-dashboard\frontend\
REM Run with: verify-structure.bat

cls
echo ================================
echo STOCK DASHBOARD - STRUCTURE CHECK
echo ================================
echo.

cd C:\Users\mukesh\Documents\stock-dashboard\frontend

echo Checking Root Files...
echo -----------------------------------
call :checkfile "package.json"
call :checkfile "vite.config.js"
call :checkfile "tailwind.config.js"
call :checkfile "postcss.config.js"
call :checkfile "index.html"
call :checkfile ".gitignore"

echo.
echo Checking src/ Files...
echo -----------------------------------
call :checkfile "src\App.jsx"
call :checkfile "src\main.jsx"
call :checkfile "src\App.css"
call :checkfile "src\index.css"

echo.
echo Checking src/components/...
echo -----------------------------------
call :checkfile "src\components\Sidebar.jsx"
call :checkfile "src\components\StockCard.jsx"
call :checkfile "src\components\SectorChart.jsx"
call :checkfile "src\components\LoadingSpinner.jsx"

echo.
echo Checking src/pages/...
echo -----------------------------------
call :checkfile "src\pages\MarketOverview.jsx"
call :checkfile "src\pages\StockAnalysis.jsx"
call :checkfile "src\pages\PortfolioPerformance.jsx"
call :checkfile "src\pages\Financials.jsx"
call :checkfile "src\pages\Forecasting.jsx"

echo.
echo Checking src/services/...
echo -----------------------------------
call :checkfile "src\services\api.js"

echo.
echo Checking src/utils/...
echo -----------------------------------
call :checkfile "src\utils\formatters.js"

echo.
echo ================================
echo FOLDER STRUCTURE
echo ================================
call :checkfolder "src"
call :checkfolder "src\components"
call :checkfolder "src\pages"
call :checkfolder "src\services"
call :checkfolder "src\utils"

echo.
echo ================================
echo CHECK COMPLETE!
echo ================================
echo.
echo If all files show [OK], run: npm run build
echo.
pause
goto :eof

:checkfile
if exist %1 (
    echo [OK] %~1
) else (
    echo [MISSING] %~1
)
goto :eof

:checkfolder
if exist %1 (
    echo [OK] %~1 folder exists
) else (
    echo [MISSING] %~1 folder NOT FOUND!
)
goto :eof