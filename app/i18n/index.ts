import en from './locales/en/landing.json';
import ru from './locales/ru/landing.json';
import kg from './locales/kg/landing.json';

export const translations = {
  en,
  ru,
  kg,
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof translations['en'];

export const defaultLocale: Locale = 'ru';

export const locales: Locale[] = ['ru', 'kg', 'en'];

export const localeNames: Record<Locale, string> = {
  ru: '🇷🇺 RU',
  kg: '🇰🇬 KR',
  en: '🇬🇧 EN',
};
