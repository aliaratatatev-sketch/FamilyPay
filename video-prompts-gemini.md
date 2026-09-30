# Промпты для генерации видео FamilyPay в Gemini

## Общие требования для всех частей:
- **Логотип**: Круглый темно-бирюзовый (teal) значок с белым символом семьи внутри, расположен в верхнем левом углу
- **Название приложения**: "FamilyPay" белыми буквами под/рядом с логотипом
- **Цветовая схема**: Градиенты от #0D6D6E (темно-бирюзовый) до #4FD1C5 (светло-бирюзовый)
- **Фон**: Чистый светлый градиент (белый → светло-бирюзовый) или современный темный (#0f1923)
- **Стиль**: Современный, минималистичный UI с плавными анимациями
- **Разрешение**: 1080x1920 (вертикальное видео для мобильных) или 1920x1080 (горизонтальное)

---

## Часть 1 (0-10 сек): Введение - Проблема

**Промпт для Gemini:**

```
Create a 10-second mobile app interface video with smooth animations.

SCENE: Modern smartphone screen on clean gradient background (white to light teal #E6FFFA).

APP BRANDING (always visible):
- Top-left corner: Circular dark teal icon (#0D6D6E) with white family silhouette symbol inside
- Next to icon: "FamilyPay" text in white, modern sans-serif font

ANIMATION SEQUENCE:
1. (0-2s): Phone screen shows empty with subtle glow effect
2. (2-4s): Notification bubble appears from mom: "Купи хлеб по дороге 🍞" (Buy bread on the way)
3. (4-7s): Scene transitions to grocery store - cash register counter visible
4. (7-10s): Phone wallet screen shows: "0 сом" in large red text with empty wallet icon, slight shake animation

VISUAL STYLE:
- Clean, modern UI design
- Soft shadows and rounded corners (16px radius)
- Smooth transitions (ease-in-out)
- Subtle gradient backgrounds
- No text overlays except app branding and UI elements

COLOR PALETTE:
- Primary: #0D6D6E (dark teal)
- Secondary: #4FD1C5 (light teal)
- Background: White to #E6FFFA gradient
- Alert: #EF4444 (red for zero balance)

TECHNICAL REQUIREMENTS:
- Resolution: 1080x1920 (vertical)
- Frame rate: 30fps
- Style: Flat design, minimalist, professional
- NO watermarks except FamilyPay branding
```

---

## Часть 2 (10-20 сек): Решение - Функция запроса

**Промпт для Gemini:**

```
Create a 10-second continuation of FamilyPay app demo showing request feature.

APP BRANDING (persistent):
- Top-left: Circular dark teal icon (#0D6D6E) with white family symbol
- Logo text: "FamilyPay" in white

ANIMATION SEQUENCE:
1. (0-3s): User taps blue button with text "+ Отправить запрос" (Send Request)
2. (3-5s): Modal slides up smoothly showing form:
   - Title: "Запрос средств" (Request Funds)
   - Amount field: User types "500 сом"
   - Purpose field: "Хлеб и молоко" (Bread and milk)
   - Category: "Продукты" (Groceries) icon 🛒
3. (5-7s): Finger taps gradient button "Отправить" (Send) - gradient from #0D6D6E to #4FD1C5
4. (7-10s): Success animation: Checkmark icon appears with particle effects, modal closes

VISUAL DETAILS:
- Form fields: White background, soft shadow, 12px rounded corners
- Button: Gradient background (#0D6D6E → #4FD1C5), white text, bold
- Success checkmark: Large circle with teal checkmark, scale-in animation
- Haptic feedback visual: Subtle glow pulse

STYLE:
- Modern iOS/Android native feel
- Smooth 60fps animations
- Material design principles
- Clean typography (SF Pro or Roboto)

COLORS:
- Background: Light gradient #F9FAFB to #E6FFFA
- Primary action: Gradient #0D6D6E to #4FD1C5
- Text: #1F2937 (dark gray)
- Success: #10B981 (green accent)
```

---

## Часть 3 (20-30 сек): Уведомления семье

**Промпт для Gemini:**

```
Create a 10-second FamilyPay app video showing family notification system.

BRANDING (top-left, always visible):
- Circular dark teal icon (#0D6D6E) with white family symbol
- "FamilyPay" text in white

ANIMATION SEQUENCE:
1. (0-3s): Split-screen showing 3 different phones side by side:
   - Left: "Мама" (Mom) phone - avatar circle with "М"
   - Center: "Папа" (Dad) phone - avatar circle with "П"  
   - Right: "Сестра" (Sister) phone - avatar circle with "С"

2. (3-6s): Notification banner slides down on ALL three phones simultaneously:
   - Header: "Новый запрос" (New Request)
   - Content: "Алишер просит 500 сом"
   - Subtext: "Хлеб и молоко 🛒"
   - Small urgent indicator icon ⚡

3. (6-8s): Dad's phone (center) highlights with glow effect
4. (8-10s): Green "Одобрить" (Approve) button appears and gets tapped with ripple effect

DESIGN ELEMENTS:
- Avatar circles: Gradient borders (#0D6D6E to #4FD1C5)
- Notification: White card, subtle shadow, slide-down animation
- Badge: Small red circle with "1" on notification
- Status bar: Time 14:32, battery, signal shown on each phone

LAYOUT:
- Three phones arranged in slight perspective view
- Phones slightly rotated (5-10 degrees) for depth
- Soft drop shadows beneath phones

COLORS:
- Phone screens: White with light teal accent
- Notification card: White with teal border-left (#4FD1C5)
- Approve button: Green #10B981
- Text: Dark gray #1F2937
```

---

## Часть 4 (30-40 сек): Мгновенный перевод

**Промпт для Gemini:**

```
Create a 10-second FamilyPay transaction animation showing instant money transfer.

BRANDING (consistent):
- Top-left: Dark teal circular icon (#0D6D6E) with white family symbol
- "FamilyPay" logo text

ANIMATION SEQUENCE:
1. (0-2s): Dad's phone screen showing:
   - Card at top: "Visa •••• 4532"
   - Balance: "42,000 сом" in large text
   - Transfer interface visible

2. (2-5s): Animated coins/money particles flowing from Dad's phone:
   - 3D coin icons with teal gradient (#0D6D6E to #4FD1C5)
   - Flowing animation arc from right to left
   - Trailing glow effect
   - Amount "500 сом" floating with coins

3. (5-8s): Coins arrive at Alisher's phone (left side):
   - Phone gently bounces/vibrates
   - Success glow animation
   - Balance updates from "0 сом" to "500 сом" with number count-up animation

4. (8-10s): Both phones show checkmarks:
   - Dad's phone: "Отправлено ✓" (Sent)
   - Alisher's phone: "Получено ✓" (Received)
   - Time stamp: "14:33" on both

VISUAL EFFECTS:
- Particle system: 10-15 coin particles
- Motion blur on moving coins
- Glow trails: Teal gradient
- Spring animation on balance number change
- Confetti burst on receive (3-4 particles)

TECHNICAL:
- Smooth curved path for coins (Bézier curve)
- Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
- 60fps smooth animation
- Depth effect: Phones slightly 3D tilted

COLORS:
- Coins: Metallic gold with teal highlights
- Glow: #4FD1C5 with 40% opacity
- Success: #10B981 green
- Background: Soft gradient white to light teal
```

---

## Часть 5 (40-50 сек): Контроль и бюджет

**Промпт для Gemini:**

```
Create a 10-second FamilyPay app video showcasing family budget dashboard.

BRANDING:
- Top-left: Circular dark teal logo (#0D6D6E) with white family icon
- "FamilyPay" text in white

ANIMATION SEQUENCE:
1. (0-3s): Transition to parent's phone showing dashboard:
   - Header: "Семейный бюджет" (Family Budget)
   - Large card showing total: "42,000 сом"
   - Subtitle: "Доступно" (Available)

2. (3-6s): Scroll down revealing expense cards:
   - Card 1: "Алишер - 500 сом" with groceries icon 🛒
   - Card 2: "Аиша - 1,200 сом" with shopping icon 🛍️  
   - Card 3: "Общие - 3,800 сом" with home icon 🏠
   - Each card: Left color strip (category color), time ago, category badge

3. (6-9s): Animated bar chart appears:
   - Horizontal bars growing from left to right
   - Bar 1 (Продукты): 35% - Teal #4FD1C5
   - Bar 2 (Транспорт): 25% - Blue #3B82F6
   - Bar 3 (Развлечения): 20% - Purple #8B5CF6
   - Percentage labels appear with count-up animation

4. (9-10s): Bottom navigation highlights "Статистика" (Statistics) tab with pulse effect

DESIGN STYLE:
- Cards: White background, 16px rounded corners, subtle shadows
- Typography: Bold numbers (24-32px), regular labels (14px)
- Icons: Filled style, colorful emojis
- Spacing: 16px padding, 12px gaps

UI ELEMENTS:
- Status indicators: Green dots for approved transactions
- Time stamps: "2 часа назад" (2 hours ago) in gray
- Category badges: Small rounded pills with icons
- Interactive: Subtle hover/tap states

COLORS:
- Background: White to very light teal gradient
- Cards: Pure white #FFFFFF
- Primary text: #1F2937
- Secondary text: #6B7280  
- Accent: Teal gradient #0D6D6E to #4FD1C5
- Chart bars: Multi-color (teal, blue, purple)
```

---

## Часть 6 (50-60 сек): Цели и накопления

**Промпт для Gemini:**

```
Create a 10-second FamilyPay app video showing family savings goals feature.

BRANDING (persistent):
- Top-left corner: Dark teal circular icon (#0D6D6E) with family symbol
- "FamilyPay" logo text

ANIMATION SEQUENCE:
1. (0-3s): Screen title "Семейные цели" (Family Goals) appears
   Goal card slides in:
   - Icon: 🏖️ (vacation)
   - Title: "Летний отпуск" (Summer Vacation)
   - Progress bar: 0% → 65% fills with gradient animation
   - Amount: "32,500 / 50,000 сом"

2. (3-5s): Second goal card appears below:
   - Icon: 🎓 (education)
   - Title: "Обучение детей" (Children's Education)  
   - Progress: 40% filled (20,000 / 50,000 сом)
   - Circular progress indicator animates

3. (5-7s): "+ Добавить цель" (Add Goal) button pulses with teal glow

4. (7-9s): Small family avatars appear around the goal cards:
   - 4 circular avatars with initials (М, П, А, С)
   - Connected with dotted lines showing contributions
   - Each avatar has small "+500" label with upward arrow

5. (9-10s): Celebration animation:
   - Confetti particles (teal, gold, blue colors)
   - Star sparkles
   - "Отличный прогресс! 🎉" (Great progress!) text banner

VISUAL DESIGN:
- Progress bars: Rounded, gradient fill (#0D6D6E to #4FD1C5)
- Cards: White with soft shadows, 20px rounded corners
- Icons: Large emoji style (48px)
- Avatar circles: 40px with gradient borders

INTERACTION DETAILS:
- Progress bar fill: Smooth animation over 2 seconds
- Numbers: Count-up animation with easing
- Confetti: 12-15 particles, random rotation, fade out
- Glow effects: Soft blur, 20px radius, teal color

COLORS:
- Card background: White #FFFFFF
- Progress filled: Gradient #0D6D6E to #4FD1C5  
- Progress empty: Light gray #E5E7EB
- Text: Dark #1F2937
- Success: Gold #F59E0B accent
- Background: Soft teal gradient
```

---

## Часть 7 (60-70 сек): Финал и призыв к действию

**Промпт для Gemini:**

```
Create a 10-second FamilyPay app video finale with call-to-action.

BRANDING (always visible):
- Center top: Large dark teal circular logo (#0D6D6E) with white family symbol
- Below logo: "FamilyPay" text in bold white

ANIMATION SEQUENCE:
1. (0-3s): Zoom out revealing phone screen with app dashboard
   Phone rotates slightly in 3D space (Y-axis rotation)
   Glowing teal ring particles orbit around the phone

2. (3-5s): Text appears above phone with fade-in + slide-up:
   - Line 1: "Управляйте финансами" (Manage finances)
   - Line 2: "всей семьей" (with whole family)
   - Font: Bold, white with subtle shadow
   - Each line animates separately (0.3s delay)

3. (5-7s): Three feature icons float in around phone:
   - Left: 💸 "Запросы" (Requests)
   - Top: 📊 "Контроль" (Control)
   - Right: 🎯 "Цели" (Goals)
   - Icons scale in with bounce effect

4. (7-9s): Large CTA button appears at bottom:
   - Text: "Начать бесплатно" (Start Free)
   - Style: Gradient button #0D6D6E to #4FD1C5
   - Width: 70% of screen
   - Height: 56px
   - Rounded corners: 28px (pill shape)
   - Pulse animation (scale 1.0 → 1.05 → 1.0)
   - Shadow: Large, teal colored, soft

5. (9-10s): Final frame holds:
   - Phone screen shows happy family illustration
   - Sparkle effects around button
   - Website text below: "familypay.app" in small gray text
   - Subtle background gradient animation (color shift)

VISUAL EFFECTS:
- 3D phone tilt: 15-20 degrees
- Particle system: 20 orbiting particles, teal gradient
- Glow: Soft bloom effect on logo and button
- Background: Radial gradient from center (white to light teal)
- Depth of field: Slight blur on background

TEXT STYLING:
- Main heading: 36px, bold, white
- Features text: 18px, medium weight, white
- CTA button: 20px, bold, white
- Website: 14px, regular, gray #6B7280

COLORS PALETTE:
- Primary gradient: #0D6D6E → #4FD1C5
- Background: Radial gradient white center to #E6FFFA edges  
- Text: White #FFFFFF
- Accents: Gold #F59E0B for sparkles
- Shadow: Teal #4FD1C5 at 30% opacity

ANIMATION EASING:
- Phone rotation: ease-in-out
- Text appearance: cubic-bezier(0.34, 1.56, 0.64, 1) - spring effect
- Button pulse: sine wave loop
- Particles: linear motion with random offset
```

---

## Технические рекомендации для Gemini:

1. **Генерируйте каждую часть отдельно** - 7 отдельных запросов
2. **Между частями проверяйте**:
   - Логотип в одном месте (верхний левый угол)
   - Одинаковые цвета (#0D6D6E и #4FD1C5)
   - Шрифты одного семейства
   - Одинаковое разрешение

3. **После генерации всех частей**:
   - Объедините в видеоредакторе (DaVinci Resolve, CapCut и т.д.)
   - Добавьте фоновую музыку (современная, легкая, мотивирующая)
   - Проверьте плавность переходов между частями

4. **Альтернативный подход** - если Gemini делает ошибки:
   - Генерируйте ключевые кадры (screenshots) для каждой сцены
   - Используйте другой инструмент для анимации между кадрами

---

## Ключевые моменты, которые ОБЯЗАТЕЛЬНО должны быть:

✅ **Проблема** (ситуация у кассы без денег)  
✅ **Уникальная фича** (запрос с мгновенным уведомлением семье)  
✅ **Быстрое решение** (любой может перевести)  
✅ **Контроль** (родители видят все расходы)  
✅ **Цели** (семья копит вместе)  
✅ **Призыв к действию** (начать бесплатно)

---

## Дополнительные советы:

- Если Gemini генерирует текст неправильно, укажите: "Text must be in Cyrillic Russian exactly as written in prompt"
- Если логотип смещается, добавьте: "Logo position MUST stay fixed at top-left corner (x:40px, y:40px) throughout entire video"
- Если цвета неправильные, приложите референс: "Use exact HEX colors specified: #0D6D6E and #4FD1C5"
