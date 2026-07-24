@echo off
cd /d "%~dp0"
echo ============================================================
echo Starting SmartStock Node.js Server...
echo Connection: MongoDB Atlas
echo ============================================================

set NODE_BIN="C:\Program Files\nodejs\node.exe"

if exist %NODE_BIN% (
    echo Using Node.js from Program Files...
    %NODE_BIN% server.js
) else (
    echo Using Node.js from PATH...
    node server.js
)

pause
