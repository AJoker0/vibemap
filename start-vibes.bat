@echo off
echo 🌍 VibeMap - Запуск полной системы активных вайбов
echo ================================================

echo 🧹 Очищаем старые процессы...
call pnpm docker:down 2>nul

echo.
echo 🚀 Запускаем все компоненты:
echo    🌍 Next.js (Frontend) - http://localhost:3001
echo    🚀 Express API Server - http://localhost:5000  
echo    🐳 MongoDB (Docker) - mongodb://localhost:27017
echo.

call pnpm dev:vibes

echo.
echo 🛑 Остановка системы...
echo Нажмите Ctrl+C для остановки всех процессов
pause
