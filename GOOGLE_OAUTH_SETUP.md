# Настройка Google OAuth

## Шаги для настройки Google OAuth

### 1. Откройте Google Cloud Console
Перейдите на [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Создайте проект
- Нажмите на выпадающее меню проекта в верхней части страницы
- Нажмите "Новый проект"
- Введите название проекта (например, "FamilyPay")
- Нажмите "Создать"

### 3. Включите Google+ API
- Перейдите в "APIs & Services" > "Library"
- Найдите "Google+ API"
- Нажмите "Enable"

### 4. Настройте OAuth consent screen
- Перейдите в "APIs & Services" > "OAuth consent screen"
- Выберите "External" (если у вас нет Google Workspace)
- Заполните обязательные поля:
  - App name: FamilyPay
  - User support email: ваш email
  - Developer contact information: ваш email
- Нажмите "Save and Continue"
- На странице "Scopes" нажмите "Save and Continue"
- На странице "Test users" добавьте свой email для тестирования
- Нажмите "Save and Continue"

### 5. Создайте OAuth 2.0 Client ID
- Перейдите в "APIs & Services" > "Credentials"
- Нажмите "Create Credentials" > "OAuth client ID"
- Выберите "Web application"
- Введите название (например, "FamilyPay Web Client")
- В разделе "Authorized JavaScript origins" добавьте:
  - `http://localhost:3000`
  - `https://ваш-домен.com` (для продакшена)
- В разделе "Authorized redirect URIs" добавьте:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://ваш-домен.com/api/auth/callback/google` (для продакшена)
- Нажмите "Create"

### 6. Скопируйте учетные данные
После создания вы увидите:
- Client ID
- Client Secret

Скопируйте эти значения и добавьте их в файл `.env`:

```env
GOOGLE_CLIENT_ID="ваш_client_id"
GOOGLE_CLIENT_SECRET="ваш_client_secret"
```

### 7. Перезапустите сервер
```bash
npm run dev
```

## Готово!
Теперь на странице `/login` должна работать кнопка "Войти через Google" ✨
