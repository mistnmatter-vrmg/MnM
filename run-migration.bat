@echo off
echo Running database migration to add password column...
echo.

wrangler d1 execute mnm-orders-db --file=migration-add-password.sql

echo.
echo Migration completed!
echo.
echo Verifying users table structure...
wrangler d1 execute mnm-orders-db --command="PRAGMA table_info(users);"

pause
