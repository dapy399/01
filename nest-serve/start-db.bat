@echo off
chcp 65001 >nul
echo ========================================
echo 启动本地数据库服务 (MongoDB + Redis)
echo ========================================

set BASE=%~dp0
set MONGO_DIR=%BASE%tools\mongodb-windows-x86_64-6.0.21\bin
set REDIS_DIR=%BASE%tools\Redis-x64-5.0.14.1
set DATA_DIR=%BASE%tools\data

:: 创建数据目录
if not exist "%DATA_DIR%\mongo" mkdir "%DATA_DIR%\mongo"
if not exist "%DATA_DIR%\redis" mkdir "%DATA_DIR%\redis"

:: 启动 MongoDB
echo [MongoDB] 正在启动...
start "MongoDB" /min cmd /c "cd /d %MONGO_DIR% && mongod.exe --dbpath %DATA_DIR%\mongo --port 27017 --bind_ip 127.0.0.1 --auth"
timeout /t 3 /nobreak >nul

:: 创建 MongoDB 用户（首次启动）
echo [MongoDB] 创建用户...
start "MongoDB Setup" /min cmd /c "cd /d %MONGO_DIR% && mongosh.exe --eval \"db = db.getSiblingDB('admin'); db.createUser({user:'user',pwd:'user123',roles:[{role:'userAdminAnyDatabase',db:'admin'},{role:'readWriteAnyDatabase',db:'admin'}]});\" 127.0.0.1:27017"

:: 启动 Redis
echo [Redis] 正在启动...
start "Redis" /min cmd /c "cd /d %REDIS_DIR% && redis-server.exe --port 6379"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo 数据库已启动:
echo   MongoDB: 127.0.0.1:27017 (user/user123)
echo   Redis:   127.0.0.1:6379
echo ========================================
echo 关闭此窗口不会停止数据库，请手动关闭 MongoDB 和 Redis 窗口
echo.
pause
