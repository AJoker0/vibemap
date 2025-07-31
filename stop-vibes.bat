@echo off
echo 🛑 Остановка всех компонентов VibeMap...
echo ========================================

echo 🐳 Останавливаем Docker контейнеры...
call pnpm docker:down

echo ✅ Все процессы остановлены!
echo.
echo 💡 Для запуска снова используйте: pnpm dev:vibes
pause
