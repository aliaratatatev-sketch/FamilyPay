---
inclusion: auto
name: responsive-development
description: Guidelines for implementing responsive design in FamilyPay application
---

# Responsive Development Guidelines for FamilyPay

## Mobile-First Approach

When implementing ANY UI component or page, ALWAYS use mobile-first approach:

1. **Start with mobile layout** (base classes without breakpoints)
2. **Add tablet adaptations** (md: prefix)
3. **Finish with desktop** (lg:, xl: prefixes)

## Required Responsive Patterns

### Touch Targets
- Minimum 44x44px for all interactive elements
- `min-h-[44px] px-6 py-3` for buttons
- `gap-2 md:gap-4` between clickable elements

### Typography
```tsx
// Headings
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
<h2 className="text-xl sm:text-2xl md:text-3xl">
<p className="text-sm sm:text-base md:text-lg">
```

### Containers
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto">
```

### Grids
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### Forms
- Full width on mobile: `w-full md:w-auto`
- Stack on mobile: `flex-col md:flex-row`
- Single column on mobile: `grid-cols-1 md:grid-cols-2`

### Navigation
- Burger menu on mobile: `hidden md:block` for menu, `md:hidden` for burger
- Horizontal menu on desktop

### Tables
- Card view on mobile: `block md:hidden`
- Table on desktop: `hidden md:table`

### Modals
- Fullscreen on mobile: slide from bottom
- Centered on desktop: `items-end md:items-center`

## Testing Checklist

Before marking ANY UI task as complete, verify:

- [ ] Tested on mobile (320px - 640px)
- [ ] Tested on tablet (768px - 1024px)
- [ ] Tested on desktop (1280px+)
- [ ] All text is readable
- [ ] All buttons are touch-friendly
- [ ] No horizontal scroll
- [ ] Images scale properly
- [ ] Forms are usable on mobile
- [ ] Navigation works on touch devices

## Development Workflow

1. **Design mobile layout first**
2. **Implement mobile version**
3. **Test on mobile** (use `npm run dev` → scan QR code)
4. **Add tablet breakpoints**
5. **Add desktop breakpoints**
6. **Final testing on all sizes**

## Common Mistakes to Avoid

❌ Desktop-first approach
❌ Forgetting touch target sizes
❌ Horizontal scroll on mobile
❌ Tiny text on mobile
❌ Tables without mobile alternative
❌ Fixed widths without breakpoints
❌ Assuming mouse/hover on mobile

## Resources

- [RESPONSIVE-GUIDE.md](../../RESPONSIVE-GUIDE.md) - Complete responsive guide
- [DEV-MOBILE.md](../../DEV-MOBILE.md) - Mobile testing setup
- Tailwind Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
