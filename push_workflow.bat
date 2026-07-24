@echo off
cd /d "%~dp0"
echo ============================================================
echo Pushing GitHub Actions Workflow to GitHub...
echo ============================================================
git push origin main
pause
