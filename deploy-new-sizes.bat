@echo off
echo ========================================
echo   Deploying New Stock Sizes
echo ========================================
echo.

echo Step 1: Running Database Migration...
wrangler d1 execute mnm-orders-db --file=add-new-sizes.sql

echo.
echo Step 2: Deploying API Worker...
wrangler deploy --config api-wrangler.toml api-index.js

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo New stock added:
echo - 50ml and 30ml bottles for all products
echo - 30 bottles each
echo.
echo API live at:
echo https://mnm-orders-api.mistnmatter.workers.dev
echo.
pause
