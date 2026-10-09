# 📱 Responsive Design Snippets

Готовые сниппеты для копирования в ваши компоненты.

## Базовый контейнер

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* content */}
</div>
```

## Заголовки

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
<h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
<p className="text-sm sm:text-base md:text-lg">
```

## Grid layouts

```tsx
{/* 1 col → 2 cols → 3 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

{/* 1 col → 2 cols → 4 cols */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

{/* Auto-fit columns */}
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
```

## Flexbox layouts

```tsx
{/* Stack → Row */}
<div className="flex flex-col md:flex-row gap-4">

{/* Responsive alignment */}
<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
```

## Buttons

```tsx
{/* Primary Button */}
<button className="
  min-h-[44px] px-6 py-3
  w-full sm:w-auto
  text-sm sm:text-base
  bg-teal-600 hover:bg-teal-700
  text-white font-medium rounded-lg
  active:scale-95 transform transition-all
">

{/* Secondary Button */}
<button className="
  min-h-[44px] px-6 py-3
  w-full sm:w-auto
  text-sm sm:text-base
  border border-gray-300 dark:border-gray-600
  text-gray-700 dark:text-gray-300
  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
  active:scale-95 transform transition-all
">
```

## Form Input

```tsx
<input
  type="text"
  className="
    w-full min-h-[44px]
    px-4 py-3
    text-sm sm:text-base
    border border-gray-300 dark:border-gray-600
    rounded-lg
    bg-white dark:bg-gray-700
    text-gray-900 dark:text-white
    focus:ring-2 focus:ring-teal-500 focus:border-transparent
    outline-none transition-all
  "
/>
```

## Form Select

```tsx
<select className="
  w-full min-h-[44px]
  px-4 py-3
  text-sm sm:text-base
  border border-gray-300 dark:border-gray-600
  rounded-lg
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-white
  focus:ring-2 focus:ring-teal-500
  outline-none
  appearance-none cursor-pointer
">
```

## Card

```tsx
<div className="
  w-full p-4 md:p-6 lg:p-8
  bg-white dark:bg-gray-800
  rounded-lg shadow-sm hover:shadow-md
  border border-gray-200 dark:border-gray-700
  transition-shadow
">
  {/* content */}
</div>
```

## Modal/Dialog

```tsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
  {/* Modal */}
  <div className="
    w-full md:max-w-lg
    bg-white dark:bg-gray-800
    rounded-t-2xl md:rounded-lg
    p-6 md:p-8
    max-h-[90vh] overflow-y-auto
  ">
    {/* content */}
  </div>
</div>
```

## Navigation

```tsx
<nav className="flex items-center justify-between px-4 py-3">
  {/* Logo */}
  <div className="flex items-center">
    <Logo />
  </div>
  
  {/* Desktop Menu */}
  <div className="hidden md:flex items-center gap-6">
    <a href="#">Link 1</a>
    <a href="#">Link 2</a>
  </div>
  
  {/* Mobile Burger */}
  <button className="md:hidden min-h-[44px] min-w-[44px]">
    <MenuIcon />
  </button>
</nav>
```

## Hide/Show by breakpoint

```tsx
{/* Hide on mobile */}
<div className="hidden md:block">Desktop only</div>

{/* Show only on mobile */}
<div className="block md:hidden">Mobile only</div>

{/* Hide on tablet */}
<div className="hidden sm:block lg:block">Skip tablet</div>
```

## Responsive spacing

```tsx
{/* Padding */}
<div className="p-4 md:p-6 lg:p-8">

{/* Margin */}
<div className="my-4 md:my-6 lg:my-8">

{/* Gap */}
<div className="flex gap-2 md:gap-4 lg:gap-6">

{/* Space between */}
<div className="space-y-4 md:space-y-6">
```

## Images

```tsx
{/* Responsive image */}
<img
  src="/image.jpg"
  alt="Description"
  className="w-full h-auto rounded-lg"
  loading="lazy"
/>

{/* Next.js Image */}
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  className="w-full h-auto rounded-lg"
/>

{/* Background cover */}
<div className="
  w-full h-48 md:h-64 lg:h-80
  bg-cover bg-center bg-no-repeat
  rounded-lg
" style={{ backgroundImage: 'url(/image.jpg)' }} />
```

## Table → Cards on mobile

```tsx
{/* Mobile Cards */}
<div className="block md:hidden space-y-4">
  {items.map(item => (
    <div key={item.id} className="p-4 bg-white rounded-lg shadow">
      <div className="font-bold">{item.name}</div>
      <div className="text-gray-600">{item.value}</div>
    </div>
  ))}
</div>

{/* Desktop Table */}
<table className="hidden md:table w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.value}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Stats Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  <div className="p-6 bg-white rounded-lg shadow">
    <div className="text-3xl sm:text-4xl font-bold text-teal-600">$1,234</div>
    <div className="text-sm sm:text-base text-gray-600 mt-2">Total Balance</div>
  </div>
  {/* more stats */}
</div>
```

## Safe areas (iOS)

```tsx
<div className="pb-safe pt-safe px-4">
  {/* content */}
</div>

{/* В globals.css добавьте: */}
@supports (padding: env(safe-area-inset-top)) {
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

## Комментарий для файла компонента

```tsx
/**
 * ComponentName
 * 
 * Mobile: [описание поведения на мобильных]
 * Tablet: [описание на планшетах]
 * Desktop: [описание на десктопе]
 * 
 * Touch targets: ✅ 44px+
 * Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
 */
```

## Быстрая проверка

```tsx
{/* Screen Size Debug Helper - удалить в продакшене */}
<div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50">
  <span className="inline sm:hidden">XS</span>
  <span className="hidden sm:inline md:hidden">SM</span>
  <span className="hidden md:inline lg:hidden">MD</span>
  <span className="hidden lg:inline xl:hidden">LG</span>
  <span className="hidden xl:inline">XL</span>
</div>
```

---

**Pro Tips:**

1. Всегда начинайте с мобильной версии
2. Используйте `min-h-[44px]` для всех кликабельных элементов
3. Тестируйте на реальных устройствах через QR-код
4. Помните про dark mode на всех breakpoints
5. Gap между кликабельными элементами минимум `gap-2`
