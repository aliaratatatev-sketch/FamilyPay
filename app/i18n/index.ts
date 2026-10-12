import en from './locales/en/landing.json';
import ru from './locales/ru/landing.json';
import kg from './locales/kg/landing.json';
import adminEn from './locales/en/admin.json';
import adminRu from './locales/ru/admin.json';
import adminKg from './locales/kg/admin.json';
import dashboardEn from './locales/en/dashboard.json';
import dashboardRu from './locales/ru/dashboard.json';
import dashboardKg from './locales/kg/dashboard.json';

export const translations = {
  en,
  ru,
  kg,
} as const;

export const adminTranslations = {
  en: adminEn,
  ru: adminRu,
  kg: adminKg,
} as const;

export const dashboardTranslations = {
  en: dashboardEn,
  ru: dashboardRu,
  kg: dashboardKg,
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof translations['en'];
export type AdminTranslationKeys = typeof adminTranslations['en'];
export type DashboardTranslationKeys = typeof dashboardTranslations['en'];

export const defaultLocale: Locale = 'ru';

export const locales: Locale[] = ['ru', 'kg', 'en'];

export const localeNames: Record<Locale, string> = {
  ru: 'RU · Русский',
  kg: 'KG · Кыргызча',
  en: 'EN · English',
};
