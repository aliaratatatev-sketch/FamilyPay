# ✅ Checklist адаптивности FamilyPay

Используйте этот checklist при разработке/проверке каждого компонента или страницы.

## 📱 Mobile (320px - 767px)

### Layout
- [ ] Нет горизонтального скролла
- [ ] Контент занимает полную ширину с комфортными отступами (px-4)
- [ ] Навигация адаптирована (бургер-меню или tabs)
- [ ] Карточки/элементы стекаются вертикально

### Typography
- [ ] Текст читабелен (минимум text-sm для body)
- [ ] Заголовки не слишком большие (text-2xl max для h1)
- [ ] Line-height достаточный (leading-relaxed)
- [ ] Нет обрезанного текста

### Interactive Elements
- [ ] Все кнопки минимум 44x44px (min-h-[44px])
- [ ] Между кликабельными элементами минимум gap-2
- [ ] Inputs/selects минимум 44px высотой
- [ ] Links легко тапнуть пальцем
- [ ] Hover states заменены на active states

### Forms
- [ ] Inputs full-width (w-full)
- [ ] Labels четкие и видимые
- [ ] Placeholders информативные
- [ ] Submit кнопки full-width
- [ ] Валидация показывается корректно

### Images
- [ ] Изображения масштабируются (w-full, h-auto)
- [ ] Не растянуты/сжаты (object-cover)
- [ ] Lazy loading включен
- [ ] Alt текст присутствует

### Tables
- [ ] Таблицы заменены на карточки (block md:hidden)
- [ ] Или horizontal scroll с указанием
- [ ] Важная информация видна без скролла

### Modals/Dialogs
- [ ] Fullscreen или slide-up анимация
- [ ] Легко закрыть (крупная кнопка/свайп)
- [ ] Контент помещается без внутреннего скролла
- [ ] Клавиатура не закрывает контент

## 📱 Tablet (768px - 1023px)

### Layout
- [ ] Используется пространство эффективно
- [ ] Grid: 2 колонки для карточек
- [ ] Sidebar может быть видим или скрыт
- [ ] Адаптивная навигация (полная или компактная)

### Interactive Elements
- [ ] Touch targets остаются 44px+
- [ ] Hover states могут появляться
- [ ] Buttons могут быть inline (не full-width)

### Forms
- [ ] 2-колоночный grid для связанных полей
- [ ] Submit кнопки inline справа

## 💻 Desktop (1024px+)

### Layout
- [ ] Максимальная ширина контента (max-w-7xl)
- [ ] Grid: 3+ колонок для карточек
- [ ] Sidebar видим
- [ ] Полная навигация

### Interactive Elements
- [ ] Hover effects работают
- [ ] Cursor: pointer на кликабельных элементах
- [ ] Tooltips появляются при hover

### Forms
- [ ] Оптимальная ширина (не слишком широкие inputs)
- [ ] Multi-column layout где уместно

### Typography
- [ ] Максимальные размеры текста (text-5xl для h1)
- [ ] Комфортная длина строки (max-w-prose)

## 🎨 Visual

### Colors
- [ ] Достаточный контраст (WCAG AA)
- [ ] Dark mode работает на всех breakpoints
- [ ] Цвета consistent на всех размерах

### Spacing
- [ ] Увеличивающиеся отступы (p-4 → p-6 → p-8)
- [ ] Gap между элементами (gap-4 → gap-6)
- [ ] Margins адаптируются (my-4 → my-8)

### Shadows & Borders
- [ ] Shadows видны но не перегружают
- [ ] Border radius consistent
- [ ] Focus rings видны и красивы

## 🧪 Testing

### Chrome DevTools
- [ ] Протестировано в Device Toolbar
- [ ] Все стандартные устройства (iPhone, iPad, Android)
- [ ] Кастомные размеры: 320px, 375px, 768px, 1024px, 1440px

### Real Devices
- [ ] Протестировано на реальном телефоне (QR code)
- [ ] Portrait и Landscape ориентации
- [ ] Touch interactions работают
- [ ] Scrolling плавный

### Browsers
- [ ] Chrome/Edge (mobile & desktop)
- [ ] Safari (iOS)
- [ ] Firefox (mobile & desktop)

## ⚡ Performance

### Mobile Performance
- [ ] Lazy loading для изображений
- [ ] Оптимизированные изображения
- [ ] Минимум JavaScript на initial load
- [ ] Fast paint (<3s)

### Network
- [ ] Работает на 3G
- [ ] Loading states показываются
- [ ] Offline fallback (опционально)

## ♿ Accessibility

### Mobile A11y
- [ ] Touch targets 44x44px minimum
- [ ] VoiceOver/TalkBack тестирование
- [ ] Focus states видны
- [ ] Tab order логичен
- [ ] ARIA labels присутствуют
- [ ] Контраст достаточен

### Keyboard Navigation
- [ ] Tab navigation работает
- [ ] Focus trap в модалах
- [ ] Skip links присутствуют

## 🔄 Animations

### Mobile Animations
- [ ] Плавные (60fps)
- [ ] Не раздражающие
- [ ] Можно отключить (prefers-reduced-motion)
- [ ] Touch feedback (active states)

## 📋 Common Issues

Проверьте что НЕТ:

- [ ] ❌ Фиксированных width без breakpoints
- [ ] ❌ Слишком мелкого текста (<14px)
- [ ] ❌ Маленьких кнопок (<44px)
- [ ] ❌ Горизонтального скролла
- [ ] ❌ Оверлеев на всю страницу без закрытия
- [ ] ❌ Hover-only функционала
- [ ] ❌ Tiny touch targets
- [ ] ❌ Unreadable text в inputs
- [ ] ❌ Flash of wrong layout
- [ ] ❌ Broken dark mode

## 🚀 Priority Pages

Порядок адаптации:

1. **Высокий приоритет:**
   - [ ] Главная страница (/)
   - [ ] Авторизация (/login)
   - [ ] Регистрация (/register)
   - [ ] Dashboard (/dashboard)
   - [ ] Список транзакций (/transactions)

2. **Средний приоритет:**
   - [ ] Бюджеты (/budgets)
   - [ ] Цели (/goals)
   - [ ] Счета (/accounts)
   - [ ] Профиль (/profile)
   - [ ] Настройки (/settings)

3. **Низкий приоритет:**
   - [ ] Админ панель (/admin)
   - [ ] Статистика (/stats)
   - [ ] История (/history)

## 📚 Resources

- [RESPONSIVE-GUIDE.md](./RESPONSIVE-GUIDE.md) - Подробное руководство
- [DEV-MOBILE.md](./DEV-MOBILE.md) - Настройка мобильного тестирования
- [MOBILE-TESTING-QUICKSTART.md](./MOBILE-TESTING-QUICKSTART.md) - Быстрый старт
- [components/examples/](./components/examples/) - Примеры компонентов

---

**Tip:** Распечатайте этот checklist и держите рядом при разработке! 📝
