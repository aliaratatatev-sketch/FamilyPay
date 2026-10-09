# 📱 Руководство по адаптивному дизайну FamilyPay

## Breakpoints Tailwind CSS

```
sm:  640px  - Телефоны (портретная ориентация)
md:  768px  - Планшеты (портретная ориентация) 
lg:  1024px - Планшеты (альбомная) / Ноутбуки
xl:  1280px - Десктопы
2xl: 1536px - Большие экраны
```

## Основные принципы

### 1. Mobile-First подход

Всегда начинайте с мобильной версии:

```tsx
// ✅ Правильно - mobile first
<div className="text-sm md:text-base lg:text-lg">

// ❌ Неправильно - desktop first  
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Адаптивные контейнеры

```tsx
// Основной контейнер
<div className="container mx-auto px-4 sm:px-6 lg:px-8">

// Максимальная ширина
<div className="max-w-7xl mx-auto">

// Контейнер для контента
<div className="max-w-4xl mx-auto px-4">
```

### 3. Адаптивные сетки

```tsx
// Grid с автоматической адаптацией
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flexbox для карточек
<div className="flex flex-col md:flex-row gap-4">
```

### 4. Адаптивный текст

```tsx
// Заголовки
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">

// Описание
<p className="text-sm sm:text-base md:text-lg">

// Лид-текст
<p className="text-base md:text-lg lg:text-xl leading-relaxed">
```

### 5. Адаптивные отступы

```tsx
// Padding
<div className="p-4 md:p-6 lg:p-8">

// Margin
<div className="my-4 md:my-6 lg:my-8">

// Gap
<div className="flex gap-2 md:gap-4 lg:gap-6">
```

## Компоненты FamilyPay

### Навигация

```tsx
// Desktop: горизонтальное меню
// Mobile: бургер-меню
<nav className="flex items-center justify-between px-4 py-3">
  <div className="flex items-center gap-8">
    <Logo />
    <div className="hidden md:flex gap-6">
      {/* Desktop menu items */}
    </div>
  </div>
  
  {/* Mobile menu button */}
  <button className="md:hidden">
    <MenuIcon />
  </button>
</nav>
```

### Карточки

```tsx
// Стеки на мобильных, сетка на десктопе
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <Card />
</div>
```

### Формы

```tsx
// Полноширинные на мобильных
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Имя" />
    <Input label="Фамилия" />
  </div>
  
  <Button className="w-full md:w-auto">
    Отправить
  </Button>
</form>
```

### Модальные окна

```tsx
// Fullscreen на мобильных, центрированные на десктопе
<div className="fixed inset-0 flex items-end md:items-center justify-center">
  <div className="w-full md:max-w-lg md:rounded-lg bg-white">
    {/* Modal content */}
  </div>
</div>
```

### Таблицы

```tsx
// Карточки на мобильных, таблица на десктопе
<div className="block md:hidden">
  {/* Mobile card view */}
  {items.map(item => (
    <Card key={item.id}>
      <div>Название: {item.name}</div>
      <div>Сумма: {item.amount}</div>
    </Card>
  ))}
</div>

<table className="hidden md:table">
  {/* Desktop table view */}
</table>
```

## Touch-friendly элементы

### Размеры кнопок

```tsx
// Минимум 44x44px для touch targets
<button className="min-h-[44px] px-6 py-3 text-base">
  Кнопка
</button>
```

### Отступы между элементами

```tsx
// Минимум 8px между кликабельными элементами
<div className="flex gap-2 md:gap-4">
  <button>Кнопка 1</button>
  <button>Кнопка 2</button>
</div>
```

## Скрытие элементов

```tsx
// Скрыть на мобильных
<div className="hidden md:block">Desktop only</div>

// Показать только на мобильных
<div className="block md:hidden">Mobile only</div>

// Скрыть на планшетах
<div className="hidden sm:block lg:block">Skip tablets</div>
```

## Viewport meta tag

Уже добавлен в Next.js по умолчанию, но важно:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
```

## Тестирование

### Chrome DevTools

1. `F12` → Device Toolbar (Ctrl+Shift+M)
2. Выберите устройство или кастомные размеры
3. Тестируйте все breakpoints

### Реальные устройства

1. `npm run dev` - покажет QR-код
2. Сканируйте на телефоне
3. Тестируйте touch-взаимодействия

### Чеклист адаптивности

- [ ] Текст читаем на всех экранах
- [ ] Кнопки легко нажимаются пальцем
- [ ] Нет горизонтального скролла
- [ ] Изображения масштабируются
- [ ] Формы удобны на мобильных
- [ ] Навигация работает на touch
- [ ] Модальные окна открываются корректно
- [ ] Таблицы адаптированы для мобильных

## Полезные классы

```css
/* Безопасные области для iOS */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Performance для мобильных

```tsx
// Ленивая загрузка изображений
<img loading="lazy" src="..." alt="..." />

// Next.js Image с оптимизацией
import Image from 'next/image';
<Image src="..." width={300} height={200} alt="..." />

// Динамический импорт тяжелых компонентов
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />
});
```

## Приоритеты разработки

1. **Критичные экраны (mobile-first):**
   - Главная страница
   - Авторизация/Регистрация
   - Dashboard
   - Список транзакций

2. **Средний приоритет:**
   - Настройки
   - Бюджеты
   - Цели

3. **Низкий приоритет:**
   - Админ панель (только desktop)
   - Статистика (частично mobile)

## Дальнейшие улучшения

- [ ] PWA для установки на устройство
- [ ] Offline режим
- [ ] Push уведомления
- [ ] Жесты свайпа
- [ ] Haptic feedback
- [ ] Dark mode с учетом системных настроек
