@echo off
echo ========================================
echo   COMPLETE DEPLOYMENT - Mist ^& Matter
echo ========================================
echo.

echo Step 1: Running Database Migrations...
echo.
wrangler d1 execute mnm-orders-db --remote --file=add-dob-column.sql
echo DOB column migration complete
echo.

echo Step 2: Deploying API Worker...
echo.
wrangler deploy --config api-wrangler.toml api-index.js
echo.

echo Step 3: Deploying Website...
echo.
wrangler pages deploy . --project-name=mnm-website
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo API: https://mnm-orders-api.mistnmatter.workers.dev
echo Website: https://mnm-website.pages.dev
echo.
echo All systems operational!
echo.
pause
