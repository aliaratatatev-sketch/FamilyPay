# Скрипт для применения миграции к Neon базе данных

Write-Host "🐘 Применение миграции к Neon PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Проверка DATABASE_URL
$envContent = Get-Content .env -Raw
if ($envContent -match "YOUR_USER|YOUR_PASSWORD|YOUR_HOST") {
    Write-Host "❌ ОШИБКА: DATABASE_URL не настроен!" -ForegroundColor Red
    Write-Host "Откройте файл .env и вставьте строку подключения из Neon Console" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Пример:" -ForegroundColor Gray
    Write-Host 'DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"' -ForegroundColor Gray
    exit 1
}

Write-Host "✅ DATABASE_URL найден" -ForegroundColor Green
Write-Host ""

# Применение миграции
Write-Host "📤 Отправка схемы в Neon..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Миграция успешно применена!" -ForegroundColor Green
    Write-Host ""
    
    # Заполнение данными
    Write-Host "📦 Заполнение начальными данными..." -ForegroundColor Cyan
    npx tsx prisma/seed.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Данные успешно загружены!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Готово! Обновите страницу Neon Console" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Следующие шаги:" -ForegroundColor Yellow
        Write-Host "  1. Обновите страницу в Neon Console" -ForegroundColor White
        Write-Host "  2. Откройте Prisma Studio: npx prisma studio" -ForegroundColor White
        Write-Host "  3. Запустите приложение: npm run dev" -ForegroundColor White
    }
}
else {
    Write-Host ""
    Write-Host "❌ Ошибка при применении миграции" -ForegroundColor Red
    Write-Host "Проверьте DATABASE_URL в файле .env" -ForegroundColor Yellow
}
