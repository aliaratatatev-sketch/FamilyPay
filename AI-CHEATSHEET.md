# 🎯 AI Cheatsheet - FamilyPay

Быстрая шпаргалка по AI-интеграции.

---

## ⚡ Команды

```bash
# Ollama
ollama serve                    # Запустить Ollama
ollama list                     # Список моделей
ollama pull mistral:latest      # Скачать Mistral
ollama stop                     # Остановить Ollama

# Проверка процессов
Get-Process | Where-Object {$_.ProcessName -eq "ollama"}
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Dev-сервер
npm run dev                     # Запустить
```

---

## 📍 API Endpoints

| Endpoint | Method | Описание | Temperature | Max Tokens |
|----------|--------|----------|-------------|------------|
| `/api/ai/chat` | POST | Чат-ассистент | 0.7 | 200 |
| `/api/ai/analyze-request` | POST | Рекомендации родителям | 0.5 | 150 |
| `/api/ai/evaluate-request` | POST | Оценка для детей | 0.3 | 100 |
| `/api/ai/daily-insight` | POST | Инсайт дня | 0.7 | 120 |
| `/api/user/profile` | GET | Роль пользователя | N/A | N/A |

---

## 🗺️ Страницы

| URL | Что делает | AI-фича |
|-----|-----------|---------|
| `/dashboard` | Главная страница | 💡 Инсайт дня |
| `/dashboard/ai-assistant` | AI-чат | 🤖 Полноценный чат |
| `/dashboard/manage-requests` | Управление запросами | 💡 Рекомендации |
| `/dashboard/money-requests` | Создание запроса | 🎯 Оценка шансов |

---

## 🎨 Системные промпты

### Для родителей (PARENT)
```typescript
const systemPrompt = `
Ты финансовый советник для родителей в семейном бюджете FamilyPay.

СТРОГО ЗАПРЕЩЕНО: банки, кредиты, субсидии, справки, инвестиции, документы
КОНТЕКСТ: Домашний семейный бюджет в Кыргызстане, валюта: сомы (KGS)
ДЛИНА: 2-3 предложения максимум
ТОН: Дружелюбный, практичные советы с цифрами

ДАННЫЕ: ${JSON.stringify(context)}

ЗАДАЧА: [описание задачи]
`;
```

### Для детей (TEEN/CHILD)
```typescript
const systemPrompt = `
Ты дружелюбный помощник для детей и подростков в семейном бюджете.

СТРОГО ЗАПРЕЩЕНО: банки, кредиты, сложные слова
КОНТЕКСТ: Домашний бюджет в Кыргызстане, валюта: сомы (KGS)
ДЛИНА: 2-3 предложения простым языком
ТОН: Поддерживающий, мотивируй экономить

ЗАДАЧА: [описание задачи]
`;
```

### Для JSON (структурированный)
```typescript
const systemPrompt = `
Верни ТОЛЬКО валидный JSON без лишнего текста:

{
  "field1": "value",
  "field2": "value"
}

ДАННЫЕ: ${JSON.stringify(data)}
`;
```

---

## 🔧 Параметры модели

### Temperature
```typescript
0.3 // Точные ответы (JSON, категории)
0.5 // Сбалансированные (рекомендации)
0.7 // Креативные (чат, инсайты)
```

### Max Tokens
```typescript
50-100   // Короткие (категории, оценки)
100-150  // Средние (рекомендации)
150-200  // Длинные (чат, инсайты)
```

---

## 🚨 Troubleshooting

### Ollama не отвечает
```bash
# 1. Проверь процесс
Get-Process ollama

# 2. Перезапусти
ollama serve

# 3. Проверь модель
ollama list
```

### AI упоминает банки
```typescript
// Усиль запрет в промпте:
"СТРОГО ЗАПРЕЩЕНО упоминать: банки, кредиты, инвестиции!"

// Добавь проверку:
if (response.includes('банк')) {
  return fallbackResponse;
}
```

### Слишком длинный ответ
```typescript
// Снизь max_tokens:
await sendOllamaMessage(prompt, userPrompt, 0.7, 50); // было 200

// Усиль в промпте:
"ВАЖНО: Отвечай СТРОГО в 2 предложениях!"
```

### Loading не пропадает
```javascript
// 1. Открой DevTools → Console
// 2. Найди ошибку
// 3. Проверь Network → /api/ai/*
// 4. Проверь Ollama: ollama list
```

---

## 📚 Документация

| Файл | Для кого | Когда читать |
|------|---------|--------------|
| [AI-QUICKSTART.md](./AI-QUICKSTART.md) | Все | Первый запуск |
| [AI-FEATURES-SUMMARY.md](./AI-FEATURES-SUMMARY.md) | Разработчики | Обзор фич |
| [AI-TEST-PROMPTS.md](./AI-TEST-PROMPTS.md) | QA | Тестирование |
| [AI-DEVELOPMENT-GUIDE.md](./AI-DEVELOPMENT-GUIDE.md) | Разработчики | Новая фича |
| [AI-INTEGRATION-COMPLETE.md](./AI-INTEGRATION-COMPLETE.md) | PM/Лиды | Отчёт |
| [AI-INDEX.md](./AI-INDEX.md) | Все | Навигация |

---

## 💡 Код-сниппеты

### API Route шаблон
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOllamaMessage } from '@/lib/ai/ollama';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { param } = await req.json();
    
    const systemPrompt = `[ваш промпт]`;
    const userPrompt = `[пользовательский запрос]`;
    
    const aiResponse = await sendOllamaMessage(systemPrompt, userPrompt, 0.7, 150);
    
    if (!aiResponse) {
      return NextResponse.json({ result: 'Fallback текст', isAI: false });
    }

    return NextResponse.json({ result: aiResponse, isAI: true });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}
```

### Frontend компонент
```typescript
const [result, setResult] = useState('');
const [isLoading, setIsLoading] = useState(false);

const loadAI = async () => {
  try {
    setIsLoading(true);
    const response = await fetch('/api/ai/your-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ param: value })
    });
    const data = await response.json();
    setResult(data.result);
  } catch (error) {
    console.error('Error:', error);
    setResult('Fallback');
  } finally {
    setIsLoading(false);
  }
};
```

### Loading State
```typescript
{isLoading && (
  <div className="flex items-center gap-2">
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" 
              stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <span>Генерирую...</span>
  </div>
)}
```

### Debounce
```typescript
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Использование:
const debouncedFetch = debounce(fetchAI, 1000);
```

---

## ✅ Чек-листы

### Перед релизом
- [ ] Ollama запущен и модель установлена
- [ ] Все 4 фичи протестированы
- [ ] Fallback работает (Ollama выключен)
- [ ] Loading states отображаются
- [ ] Нет упоминаний банков
- [ ] Длина ответов 2-4 предложения
- [ ] Логирование настроено

### Новая AI-фича
- [ ] API route создан
- [ ] Авторизация добавлена
- [ ] Валидация входных данных
- [ ] Системный промпт соответствует правилам
- [ ] Fallback реализован
- [ ] Frontend с loading state
- [ ] Обработка ошибок
- [ ] Тесты добавлены
- [ ] Документация обновлена

---

## 🎯 Быстрые тесты

### Чат
```
Вопрос: "Как распределить 50000 сом на месяц?"
Ожидание: Конкретные проценты, категории, 2-3 предложения
```

### Рекомендации
```json
{
  "amount": 5000,
  "description": "Хочу купить скины в игре",
  "childName": "Алина",
  "familyBalance": 50000
}
Ожидание: "10% от баланса. Рекомендуем одобрить частично..."
```

### Оценка
```
Сумма: 1500
Описание: "Учебник по математике"
Ожидание: Category: "Образование", Chance: "Высокий"
```

### Инсайт
```
Проверь /dashboard
Ожидание: Загрузка инсайта за 2-3 секунды
```

---

## 🔗 Полезные ссылки

- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Mistral Model](https://huggingface.co/mistralai/Mistral-7B-v0.1)
- [Next.js Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 📊 Метрики

| Метрика | Значение |
|---------|----------|
| API Endpoints | 5 |
| Страниц с AI | 4 |
| Строк кода | ~2000+ |
| Документов | 7 |
| Тестов | 20+ |
| Время ответа | 1-3s |

---

## 🎨 UI Элементы

### Цвета AI
```css
/* Градиент */
from-purple-500 to-indigo-600

/* Фон */
bg-purple-50 dark:bg-purple-900/10

/* Граница */
border-purple-200 dark:border-purple-800

/* Текст */
text-purple-800 dark:text-purple-300
```

### Иконки
```
🤖 - AI ассистент
💡 - Рекомендации
🎯 - Оценка
✨ - Новая фича
```

---

## 🚀 Быстрый старт (1 минута)

```bash
# 1. Запусти Ollama
ollama serve

# 2. Запусти dev-сервер
npm run dev

# 3. Открой браузер
http://localhost:3000/dashboard

# 4. Тест
Нажми на "Открыть чат с AI"
```

---

**Версия**: 1.0  
**Дата**: Декабрь 2024  
**Статус**: ✅ Ready

**Сохрани этот файл для быстрого доступа! 📌**
