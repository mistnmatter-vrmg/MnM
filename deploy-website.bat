@echo off
echo ========================================
echo   Deploying Mist & Matter Website
echo ========================================
echo.

echo Deploying to Cloudflare Pages...
wrangler pages deploy . --project-name=mnm-website

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your website is live at:
echo https://mnm-website.pages.dev
echo.
pause
