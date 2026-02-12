@echo off
echo ========================================
echo   Deploying MnM Orders API
echo ========================================
echo.

echo Step 1: Deploying Worker...
wrangler deploy --config api-wrangler.toml api-index.js

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your API is live at:
echo https://mnm-orders-api.mistnmatter.workers.dev
echo.
echo Next Steps:
echo 1. Update API_BASE_URL in api-client.js
echo 2. Test API endpoints
echo 3. Update frontend files
echo.
pause
