'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/app/i18n/LocaleContext';
import { Locale } from '@/app/i18n';

const languages: Locale[] = ['ru', 'kg', 'en'];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Отслеживаем изменения темы
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setLangOpen(!langOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          isDark
            ? 'bg-white/10 text-gray-200 hover:bg-white/20'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Выбрать язык"
      >
        <span>🌐</span>
        <span>{locale.toUpperCase()}</span>
      </button>
      {langOpen && (
        <>
          {/* Overlay для закрытия при клике вне */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setLangOpen(false)}
          />
          <div
            className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${
              isDark ? 'bg-[#1a2535] border-white/10' : 'bg-white border-gray-100'
            }`}
          >
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => { 
                  setLocale(l); 
                  setLangOpen(false); 
                }}
                className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-2 ${
                  locale === l
                    ? 'text-[#0D6D6E] dark:text-[#4FD1C5] bg-[#0D6D6E]/10 dark:bg-[#4FD1C5]/10 font-semibold'
                    : isDark
                    ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  locale === l
                    ? 'bg-[#0D6D6E]/20 dark:bg-[#4FD1C5]/20 text-[#0D6D6E] dark:text-[#4FD1C5]'
                    : isDark
                    ? 'bg-white/10 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {l.toUpperCase()}
                </span>
                <span className="text-sm">
                  {l === 'ru' ? 'Русский' : l === 'kg' ? 'Кыргызча' : 'English'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
