@echo off
echo Cleaning previous builds and stopping node processes...
taskkill /F /IM node.exe 2>nul || echo no node processes
rd /s /q .next 2>nul || echo .next removed or not present
rd /s /q .next-build 2>nul || echo .next-build removed or not present
rd /s /q data\next 2>nul || echo data\next removed or not present
echo Installing dependencies (if needed)...
npm install
echo Starting dev server on port 3000
npm run dev
pause
