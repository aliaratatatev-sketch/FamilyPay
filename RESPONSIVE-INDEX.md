# 📱 Индекс документации по адаптивности

Быстрая навигация по всей документации адаптивной разработки FamilyPay.

---

## 🚀 Быстрый старт

**Хочу начать прямо сейчас:**
1. [MOBILE-TESTING-QUICKSTART.md](./MOBILE-TESTING-QUICKSTART.md) - 3 шага до тестирования
2. Запустите `npm run dev`
3. Отсканируйте QR-код
4. Откройте `/test-responsive` на телефоне

---

## 📚 Основная документация

### Для разработчиков

| Документ | Что внутри | Когда использовать |
|----------|------------|-------------------|
| [RESPONSIVE-GUIDE.md](./RESPONSIVE-GUIDE.md) | Полное руководство по адаптивному дизайну, breakpoints, паттерны | Первое чтение, референс при разработке |
| [RESPONSIVE-SNIPPET.md](./RESPONSIVE-SNIPPET.md) | Готовые сниппеты кода для копирования | Каждый раз при создании компонента |
| [RESPONSIVE-CHECKLIST.md](./RESPONSIVE-CHECKLIST.md) | Детальный checklist проверки | Перед commit, перед PR, перед релизом |

### Для тестирования

| Документ | Что внутри | Когда использовать |
|----------|------------|-------------------|
| [DEV-MOBILE.md](./DEV-MOBILE.md) | Настройка мобильного тестирования, troubleshooting | При настройке окружения, при проблемах |
| [MOBILE-TESTING-QUICKSTART.md](./MOBILE-TESTING-QUICKSTART.md) | Быстрый старт тестирования | Первый запуск, новые члены команды |

### Резюме и обзор

| Документ | Что внутри | Когда использовать |
|----------|------------|-------------------|
| [ADAPTIVE-SETUP-SUMMARY.md](./ADAPTIVE-SETUP-SUMMARY.md) | Резюме всей настройки, что сделано | Ознакомление, отчеты, обзор |

---

## 🎨 Примеры кода

### Референсные компоненты

| Файл | Описание | Строк | Демонстрирует |
|------|----------|-------|--------------|
| [ResponsiveCard.tsx](./components/examples/ResponsiveCard.tsx) | Адаптивная карточка | ~200 | Grid, Flexbox, Typography, Buttons |
| [ResponsiveForm.tsx](./components/examples/ResponsiveForm.tsx) | Адаптивная форма | ~300 | Inputs, Selects, Validation, Buttons |

### Тестовая страница

**URL:** `/test-responsive`  
**Файл:** [app/test-responsive/page.tsx](./app/test-responsive/page.tsx)

**Включает:**
- Индикатор breakpoint
- Сетка карточек
- Форма
- Типографика
- Кнопки
- Spacing
- Инструкции

---

## 🛠️ Инструменты

### Скрипты

| Файл | Что делает |
|------|-----------|
| [scripts/show-qr.js](./scripts/show-qr.js) | Генерирует QR-код с IP адресом |
| [scripts/dev-with-qr.js](./scripts/dev-with-qr.js) | Dev сервер + автоматический QR-код |

### Команды

```bash
npm run dev        # Dev сервер + QR-код
npm run dev:clean  # Dev сервер без QR-кода
npm run qr         # Показать только QR-код
```

---

## 🎯 Workflow использования

### Сценарий 1: Создание нового компонента

```
1. Читаю RESPONSIVE-GUIDE.md (секция про нужный компонент)
   ↓
2. Копирую сниппет из RESPONSIVE-SNIPPET.md
   ↓
3. Смотрю пример в components/examples/
   ↓
4. Пишу код
   ↓
5. Тестирую с npm run dev + QR-код
   ↓
6. Проверяю по RESPONSIVE-CHECKLIST.md
   ↓
7. Готово!
```

### Сценарий 2: Адаптация существующего компонента

```
1. Читаю RESPONSIVE-CHECKLIST.md (что нужно проверить)
   ↓
2. Открываю компонент
   ↓
3. Добавляю breakpoints из RESPONSIVE-SNIPPET.md
   ↓
4. Тестирую на /test-responsive
   ↓
5. Тестирую на реальном устройстве (QR-код)
   ↓
6. Проверяю все пункты checklist
   ↓
7. Готово!
```

### Сценарий 3: Code Review

```
1. Открываю RESPONSIVE-CHECKLIST.md
   ↓
2. Проверяю каждый пункт в коде
   ↓
3. Тестирую на /test-responsive
   ↓
4. Тестирую на реальном устройстве
   ↓
5. Оставляю комментарии или approve
```

---

## 📖 Темы и разделы

### По типу контента

**Layout:**
- Grid layouts → RESPONSIVE-GUIDE.md, секция "Адаптивные сетки"
- Flexbox → RESPONSIVE-SNIPPET.md, "Flexbox layouts"
- Containers → RESPONSIVE-SNIPPET.md, "Базовый контейнер"

**Typography:**
- Заголовки → RESPONSIVE-SNIPPET.md, "Заголовки"
- Параграфы → RESPONSIVE-GUIDE.md, секция "Адаптивный текст"
- Line heights → ResponsiveForm.tsx, примеры

**Interactive Elements:**
- Кнопки → RESPONSIVE-SNIPPET.md, "Buttons"
- Inputs → ResponsiveForm.tsx, примеры
- Touch targets → RESPONSIVE-CHECKLIST.md, "Interactive Elements"

**Components:**
- Cards → ResponsiveCard.tsx
- Forms → ResponsiveForm.tsx
- Navigation → RESPONSIVE-GUIDE.md, "Навигация"
- Modals → RESPONSIVE-SNIPPET.md, "Modal/Dialog"
- Tables → RESPONSIVE-SNIPPET.md, "Table → Cards"

### По устройству

**Mobile (320-767px):**
- RESPONSIVE-CHECKLIST.md, секция "Mobile"
- RESPONSIVE-GUIDE.md, все примеры mobile-first
- ResponsiveCard.tsx, базовые классы

**Tablet (768-1023px):**
- RESPONSIVE-CHECKLIST.md, секция "Tablet"
- RESPONSIVE-GUIDE.md, md: breakpoint
- ResponsiveForm.tsx, grid адаптации

**Desktop (1024px+):**
- RESPONSIVE-CHECKLIST.md, секция "Desktop"
- RESPONSIVE-GUIDE.md, lg:, xl: breakpoints
- /test-responsive, desktop view

### По задаче

**Тестирование:**
- DEV-MOBILE.md - настройка
- MOBILE-TESTING-QUICKSTART.md - быстрый старт
- /test-responsive - демо
- Chrome DevTools - инструкция в RESPONSIVE-GUIDE.md

**Проверка качества:**
- RESPONSIVE-CHECKLIST.md - полный checklist
- RESPONSIVE-GUIDE.md, секция "Тестирование"
- Реальное устройство - QR-код

**Troubleshooting:**
- DEV-MOBILE.md, секция "Troubleshooting"
- MOBILE-TESTING-QUICKSTART.md, "Troubleshooting"

---

## 🎓 Обучающие материалы

### Для новичков

1. [MOBILE-TESTING-QUICKSTART.md](./MOBILE-TESTING-QUICKSTART.md) - Начните здесь
2. [RESPONSIVE-GUIDE.md](./RESPONSIVE-GUIDE.md) - Прочитайте основы
3. [ResponsiveCard.tsx](./components/examples/ResponsiveCard.tsx) - Изучите пример
4. `/test-responsive` - Посмотрите в действии
5. [RESPONSIVE-SNIPPET.md](./RESPONSIVE-SNIPPET.md) - Используйте в работе

### Для опытных

1. [RESPONSIVE-CHECKLIST.md](./RESPONSIVE-CHECKLIST.md) - Референс для проверки
2. [RESPONSIVE-SNIPPET.md](./RESPONSIVE-SNIPPET.md) - Быстрые сниппеты
3. [ResponsiveForm.tsx](./components/examples/ResponsiveForm.tsx) - Продвинутые паттерны

---

## 🔍 Поиск по ключевым словам

**Breakpoints:** RESPONSIVE-GUIDE.md, RESPONSIVE-SNIPPET.md  
**Touch targets:** RESPONSIVE-CHECKLIST.md, ResponsiveCard.tsx  
**Grid:** RESPONSIVE-SNIPPET.md, ResponsiveCard.tsx  
**Flexbox:** RESPONSIVE-SNIPPET.md, ResponsiveForm.tsx  
**Buttons:** RESPONSIVE-SNIPPET.md, ResponsiveCard.tsx  
**Forms:** ResponsiveForm.tsx, RESPONSIVE-SNIPPET.md  
**Typography:** RESPONSIVE-SNIPPET.md, /test-responsive  
**Navigation:** RESPONSIVE-GUIDE.md, RESPONSIVE-SNIPPET.md  
**Modals:** RESPONSIVE-SNIPPET.md, RESPONSIVE-GUIDE.md  
**Tables:** RESPONSIVE-SNIPPET.md, RESPONSIVE-GUIDE.md  
**Dark mode:** ResponsiveCard.tsx, ResponsiveForm.tsx  
**Testing:** DEV-MOBILE.md, MOBILE-TESTING-QUICKSTART.md  
**QR-код:** DEV-MOBILE.md, MOBILE-TESTING-QUICKSTART.md  
**Checklist:** RESPONSIVE-CHECKLIST.md  
**Snippets:** RESPONSIVE-SNIPPET.md  

---

## 📊 Статистика

- **Документов:** 6
- **Примеров компонентов:** 2
- **Скриптов:** 2
- **Команд:** 3
- **Тестовых страниц:** 1
- **Общий объем:** ~5000+ строк

---

## 🆘 Помощь

**Не работает QR-код:**
→ [MOBILE-TESTING-QUICKSTART.md](./MOBILE-TESTING-QUICKSTART.md), секция "Troubleshooting"

**Не знаю с чего начать:**
→ [MOBILE-TESTING-QUICKSTART.md](./MOBILE-TESTING-QUICKSTART.md)

**Нужен пример кода:**
→ [RESPONSIVE-SNIPPET.md](./RESPONSIVE-SNIPPET.md) или [components/examples/](./components/examples/)

**Как проверить качество:**
→ [RESPONSIVE-CHECKLIST.md](./RESPONSIVE-CHECKLIST.md)

**Полное руководство:**
→ [RESPONSIVE-GUIDE.md](./RESPONSIVE-GUIDE.md)

**Настройка окружения:**
→ [DEV-MOBILE.md](./DEV-MOBILE.md)

---

## 🔗 Быстрые ссылки

### Самое используемое

1. [RESPONSIVE-SNIPPET.md](./RESPONSIVE-SNIPPET.md) - Копируй код отсюда
2. [RESPONSIVE-CHECKLIST.md](./RESPONSIVE-CHECKLIST.md) - Проверяй по этому
3. [ResponsiveCard.tsx](./components/examples/ResponsiveCard.tsx) - Смотри как делать
4. `/test-responsive` - Тестируй здесь

### Команды

```bash
npm run dev        # Запуск с QR
npm run dev:clean  # Запуск без QR
npm run qr         # Только QR
```

### URLs

- Тестовая страница: `http://localhost:3000/test-responsive`
- Главная: `http://localhost:3000`

---

**Совет:** Добавьте этот файл в закладки для быстрого доступа! 🔖

---

*Обновлено: Октябрь 2026*  
*Проект: FamilyPay*
