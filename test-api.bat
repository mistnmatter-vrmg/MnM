@echo off
echo ========================================
echo   API HEALTH CHECK
echo ========================================
echo.

echo Testing Stock API...
curl -s https://mnm-orders-api.mistnmatter.workers.dev/api/stock
echo.
echo.

echo Testing Orders API...
curl -s https://mnm-orders-api.mistnmatter.workers.dev/api/orders
echo.
echo.

echo ========================================
echo   Health Check Complete
echo ========================================
pause
