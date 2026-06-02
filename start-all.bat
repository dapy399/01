@echo off
chcp 65001 >nul
echo ========================================
echo Start AI Medical RAG Project
echo ========================================

echo [1/3] Starting MongoDB...
start "MongoDB" cmd /c "cd /d D:\ampa_migra\C\APP\study\mongodb-windows-x86_64-6.0.21\mongodb-win32-x86_64-windows-6.0.21\bin && mongod.exe --dbpath ..\..\data --port 27017 --bind_ip 127.0.0.1"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Redis...
start "Redis" cmd /c "cd /d D:\ampa_migra\项目\ai医疗知识库\ai医疗rag项目3.0_1760229483503\ai医疗rag项目3.0\nest-serve\tools\Redis-x64-5.0.14.1 && redis-server.exe"
timeout /t 2 /nobreak >nul

echo [3/3] Starting NestJS Backend...
cd /d D:\ampa_migra\项目\ai医疗知识库\ai医疗rag项目3.0_1760229483503\ai医疗rag项目3.0\nest-serve
start "NestJS Backend" cmd /k "pnpm start"

echo.
echo ========================================
echo Services started:
echo   MongoDB: 127.0.0.1:27017
echo   Redis:   127.0.0.1:6379
echo   Backend: http://127.0.0.1:7005
echo ========================================
echo.
echo Start frontend manually:
echo   cd project-user ^&^& pnpm dev
echo.
pause
