@echo off
echo Adding 50ml and 30ml bottles to stock...
echo.

wrangler d1 execute mnm-orders-db --file=add-new-sizes.sql

echo.
echo Migration completed!
echo.
echo New stock added:
echo - Royal Cotton 50ml: 30 bottles
echo - Royal Cotton 30ml: 30 bottles
echo - White Tea ^& Woods 50ml: 30 bottles
echo - White Tea ^& Woods 30ml: 30 bottles
echo - scc 50ml: 30 bottles
echo - scc 30ml: 30 bottles
echo - Ivory Linen 50ml: 30 bottles
echo - Ivory Linen 30ml: 30 bottles
echo.
pause
