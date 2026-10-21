# Настройка Vercel для FamilyPay

## Проблема с входом через Google

Если после выбора аккаунта Google вас возвращает обратно на страницу входа, проблема в настройках переменных окружения на Vercel.

## Шаги для исправления:

### 1. Настройте переменные окружения на Vercel

Зайдите в [Vercel Dashboard](https://vercel.com/dashboard) → выберите проект `family-pay` → Settings → Environment Variables

Убедитесь, что установлены следующие переменные для **Production**:

```
NEXTAUTH_URL=https://family-pay-ashy.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-connection-string
```

⚠️ Замените значения на ваши реальные ключи из файла `.env`

**ВАЖНО**: `NEXTAUTH_URL` должна совпадать с URL вашего приложения на Vercel!

### 2. Проверьте настройки Google OAuth

Зайдите в [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Выберите ваш проект
2. Перейдите в **Credentials** (Учетные данные)
3. Найдите ваш OAuth 2.0 Client ID
4. В разделе **Authorized redirect URIs** должны быть:
   - `http://localhost:3000/api/auth/callback/google` (для локальной разработки)
   - `https://family-pay-ashy.vercel.app/api/auth/callback/google` (для продакшена)

Если второго URL нет - добавьте его!

### 3. Пересоберите приложение

После изменения переменных окружения на Vercel:

1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите на три точки → **Redeploy**
4. Выберите **Use existing Build Cache** = ✅
5. Нажмите **Redeploy**

### 4. Проверьте логи

После деплоя перейдите на сайт и попробуйте войти через Google.

Если проблема остается:
1. Откройте **Deployments** → выберите последний деплой → **View Function Logs**
2. Попробуйте войти через Google
3. Посмотрите на логи в консоли - там будут сообщения с префиксами:
   - `✅ SignIn callback triggered`
   - `🔄 Redirect callback triggered`
   - `📝 Session callback triggered`

Это поможет понять, где именно происходит проблема.

## Дополнительная информация

### Как работает NextAuth с Google

1. Пользователь нажимает "Войти через Google"
2. NextAuth перенаправляет на Google OAuth страницу
3. Пользователь выбирает аккаунт и соглашается
4. Google перенаправляет на `https://your-domain.com/api/auth/callback/google?code=...`
5. NextAuth обрабатывает код, получает данные пользователя
6. Вызывается `signIn` callback - проверяет, можно ли войти
7. Если успешно - создается сессия
8. Вызывается `redirect` callback - определяет, куда перенаправить
9. Пользователь попадает на `/dashboard`

### Частые ошибки

- **redirect_uri_mismatch** - проверьте Authorized redirect URIs в Google Console
- **Возврат на /login** - проверьте `NEXTAUTH_URL` на Vercel
- **AccessDenied** - проверьте callback `signIn` в `lib/auth.ts`

## Контакты

Если проблема сохраняется, напишите разработчику с описанием и скриншотами логов.
