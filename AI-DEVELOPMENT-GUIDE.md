# 🛠️ AI Development Guide для FamilyPay

Руководство по добавлению новых AI-функций в проект.

---

## Архитектура

```
┌─────────────────────────────────────────────┐
│          Frontend (React Components)         │
│  - Вызывает API endpoints                    │
│  - Отображает loading states                 │
│  - Обрабатывает ошибки                       │
└──────────────────┬──────────────────────────┘
                   │ fetch()
                   ▼
┌─────────────────────────────────────────────┐
│         API Routes (/app/api/ai/*)           │
│  - Валидация входных данных                  │
│  - Проверка авторизации                      │
│  - Формирование системного промпта           │
│  - Вызов sendOllamaMessage()                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Ollama Helper (lib/ai/ollama.ts)     │
│  - HTTP запрос к Ollama API                  │
│  - Fallback логика                           │
│  - Обработка ошибок                          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Ollama Server (localhost:11434)      │
│  - Mistral 7B model                          │
│  - Генерация ответов                         │
└─────────────────────────────────────────────┘
```

---

## Шаг 1: Создай API Route

### Шаблон файла `/app/api/ai/your-feature/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOllamaMessage } from '@/lib/ai/ollama';

export async function POST(req: Request) {
  try {
    // 1. Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // 2. Получение и валидация данных
    const { param1, param2 } = await req.json();
    
    if (!param1 || !param2) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }

    // 3. Формирование системного промпта
    const systemPrompt = `
Ты AI-ассистент семейного бюджета FamilyPay в Кыргызстане.

ПРАВИЛА:
- НИКОГДА не упоминай: банки, субсидии, документы, справки, инвестиции
- Это домашний семейный бюджет в сомах (KGS)
- Отвечай в 2-3 предложениях максимум
- Используй простой, дружелюбный язык
- Фокус на практических советах

КОНТЕКСТ:
${JSON.stringify({ param1, param2 })}

ЗАДАЧА: [опиши задачу]
`;

    // 4. Формирование user prompt
    const userPrompt = `Параметр 1: ${param1}, Параметр 2: ${param2}`;

    // 5. Вызов Ollama
    const aiResponse = await sendOllamaMessage(
      systemPrompt,
      userPrompt,
      0.7, // temperature
      150  // max_tokens
    );

    // 6. Fallback если Ollama не ответил
    if (!aiResponse) {
      return NextResponse.json({
        result: 'Фоллбэк текст, если AI недоступен',
        isAI: false
      });
    }

    // 7. Возврат результата
    return NextResponse.json({
      result: aiResponse,
      isAI: true
    });

  } catch (error) {
    console.error('❌ Ошибка в /api/ai/your-feature:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
```

---

## Шаг 2: Интегрируй во Frontend

### Пример компонента

```typescript
'use client';

import { useState } from 'react';

export default function YourFeaturePage() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const loadAIResult = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/ai/your-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          param1: 'value1',
          param2: 'value2'
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка запроса');
      }

      const data = await response.json();
      setResult(data.result);
      
    } catch (error) {
      console.error('Ошибка загрузки AI:', error);
      setResult('Не удалось получить ответ AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadAIResult}>
        Получить AI-совет
      </button>

      {isLoading && (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            {/* spinner icon */}
          </svg>
          <span>Генерирую ответ...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Шаг 3: Настройка параметров

### Temperature (креативность)
```typescript
// 0.3 - Точные, предсказуемые ответы (JSON, категоризация)
await sendOllamaMessage(systemPrompt, userPrompt, 0.3, 100);

// 0.5 - Сбалансированные ответы (рекомендации, анализ)
await sendOllamaMessage(systemPrompt, userPrompt, 0.5, 150);

// 0.7 - Креативные ответы (чат, инсайты)
await sendOllamaMessage(systemPrompt, userPrompt, 0.7, 200);
```

### Max Tokens (длина)
```typescript
// 50-100 - Короткие ответы (категории, оценки)
// 100-150 - Средние ответы (рекомендации)
// 150-200 - Длинные ответы (чат, инсайты)
```

---

## Best Practices

### ✅ DO:
1. **Всегда добавляй fallback**
   ```typescript
   if (!aiResponse) {
     return fallbackResponse;
   }
   ```

2. **Используй debounce для частых запросов**
   ```typescript
   const debouncedFetch = debounce(fetchAI, 1000);
   ```

3. **Логируй ошибки**
   ```typescript
   console.error('❌ AI Error:', error);
   ```

4. **Добавляй loading states**
   ```typescript
   {isLoading && <Spinner />}
   ```

5. **Валидируй входные данные**
   ```typescript
   if (!param1 || param1.length > 500) {
     return error;
   }
   ```

### ❌ DON'T:
1. **Не отправляй чувствительные данные**
   ```typescript
   // ❌ Плохо
   body: JSON.stringify({ password, email })
   
   // ✅ Хорошо
   body: JSON.stringify({ userId, amount })
   ```

2. **Не полагайся только на AI**
   ```typescript
   // ❌ Плохо - нет fallback
   const result = await sendOllamaMessage(...);
   return result; // что если null?
   
   // ✅ Хорошо - есть fallback
   const result = await sendOllamaMessage(...);
   return result || fallbackResponse;
   ```

3. **Не игнорируй ошибки**
   ```typescript
   // ❌ Плохо
   try { ... } catch {}
   
   // ✅ Хорошо
   try { ... } catch (error) {
     console.error('Error:', error);
     return fallback;
   }
   ```

---

## Типовые системные промпты

### Для анализа (родители)
```typescript
const systemPrompt = `
Ты финансовый советник для родителей.

ПРАВИЛА:
- Никаких банков, кредитов, субсидий
- Домашний бюджет в сомах (KGS)
- Конкретные цифры и проценты
- 2-3 предложения

КОНТЕКСТ: ${JSON.stringify(context)}

Дай рекомендацию: одобрить/отклонить/частично.
`;
```

### Для помощи (дети)
```typescript
const systemPrompt = `
Ты дружелюбный помощник для детей и подростков.

ПРАВИЛА:
- Простой язык, без сложных слов
- Никаких банков и документов
- Мотивируй экономить
- 2-3 предложения

ЗАДАЧА: Объясни, как накопить на покупку.
`;
```

### Для оценки (структурированный JSON)
```typescript
const systemPrompt = `
Верни ТОЛЬКО валидный JSON без лишнего текста:

{
  "category": "Категория",
  "approvalChance": "Высокий/Средний/Низкий",
  "reason": "Краткая причина"
}

ДАННЫЕ: ${JSON.stringify(data)}
`;
```

---

## Дебаггинг

### Проблема: AI не отвечает
```bash
# Проверь Ollama
ollama list
ollama serve

# Проверь логи в консоли браузера
# Проверь Network tab (DevTools)
```

### Проблема: Слишком долгий ответ
```typescript
// Снизь max_tokens
await sendOllamaMessage(prompt, userPrompt, 0.7, 50); // было 200

// Усиль системный промпт
"ВАЖНО: Отвечай СТРОГО в 2 предложениях. Не больше!"
```

### Проблема: AI упоминает банки
```typescript
// Усиль запрет в промпте
"СТРОГО ЗАПРЕЩЕНО упоминать: банки, кредиты, инвестиции, 
субсидии, справки, документы. Это ДОМАШНИЙ бюджет!"

// Добавь проверку в коде
if (response.includes('банк') || response.includes('кредит')) {
  return fallbackResponse;
}
```

---

## Чек-лист для новой фичи

- [ ] API route создан в `/app/api/ai/`
- [ ] Добавлена проверка авторизации
- [ ] Валидация входных данных
- [ ] Системный промпт соответствует правилам
- [ ] Fallback логика реализована
- [ ] Frontend компонент с loading state
- [ ] Обработка ошибок (try/catch)
- [ ] Логирование ошибок (console.error)
- [ ] Тестирование с Ollama включенным
- [ ] Тестирование с Ollama выключенным
- [ ] Проверка на упоминание банков
- [ ] Длина ответа ~2-4 предложения
- [ ] Добавлены тесты в AI-TEST-PROMPTS.md

---

## Примеры реальных фич

### 1. Чат (простой)
```typescript
// API: /app/api/ai/chat/route.ts
// Frontend: app/dashboard/ai-assistant/page.tsx
// Temperature: 0.7 (креативность)
// Max tokens: 200
```

### 2. Рекомендации (аналитика)
```typescript
// API: /app/api/ai/analyze-request/route.ts
// Frontend: app/dashboard/manage-requests/page.tsx
// Temperature: 0.5 (баланс)
// Max tokens: 150
```

### 3. Оценка (структурированный JSON)
```typescript
// API: /app/api/ai/evaluate-request/route.ts
// Frontend: app/dashboard/money-requests/page.tsx
// Temperature: 0.3 (точность)
// Max tokens: 100
```

---

## Полезные ссылки

- [Ollama API Docs](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Mistral Model Card](https://huggingface.co/mistralai/Mistral-7B-v0.1)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Версия**: 1.0  
**Автор**: FamilyPay Dev Team  
**Дата**: Декабрь 2024
