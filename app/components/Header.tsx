'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { Locale, localeNames } from '../i18n';
import ThemeToggle from './ThemeToggle';

const languages: Locale[] = ['ru', 'kg', 'en'];

const FlagIcon = ({ code }: { code: Locale }) => {
  const flags = {
    ru: (
      <svg viewBox="0 0 640 480" className="w-6 h-5 rounded">
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#0039a6" d="M0 160h640v320H0z"/>
          <path fill="#d52b1e" d="M0 320h640v160H0z"/>
        </g>
      </svg>
    ),
    kg: (
      <svg viewBox="0 0 640 480" className="w-6 h-5 rounded">
        <path fill="#e8112d" d="M0 0h640v480H0z"/>
        <path fill="#ffef00" d="M300.8 360.5a79.7 79.7 0 1 1 0-159.3 79.7 79.7 0 0 1 0 159.3zm0-19.9a59.8 59.8 0 1 0 0-119.6 59.8 59.8 0 0 0 0 119.6z"/>
        <path fill="#ffef00" d="M300.8 240.2c11 0 19.9 8.9 19.9 19.9s-8.9 19.9-19.9 19.9-19.9-8.9-19.9-19.9 8.9-19.9 19.9-19.9z"/>
      </svg>
    ),
    en: (
      <svg viewBox="0 0 640 480" className="w-6 h-5 rounded">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
        <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
        <path fill="#C8102E" d="M0 193v94h640v-94H0zM273 0v480h96V0h-96z"/>
      </svg>
    )
  };
  return flags[code];
};

const languageFullNames: Record<Locale, string> = {
  ru: 'Русский',
  kg: 'Кыргызча',
  en: 'English'
};

export default function Header() {
  const { locale, setLocale, t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#0f1923]/95 backdrop-blur-md shadow-lg shadow-black/30'
            : 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/10'
          : isDark
          ? 'bg-transparent'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-[#0D6D6E]/40 transition-shadow duration-300">
              <Image
                src="/logo.png"
                alt="FamilyPay"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              {t.header.brand}
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: t.header.nav.about, href: '#about' },
              { label: t.header.nav.features, href: '#features' },
              { label: t.header.nav.howItWorks, href: '#how-it-works' },
              { label: t.header.nav.pricing, href: '#pricing' },
              { label: t.header.nav.contact, href: '#contact' }
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-[#0D6D6E] dark:hover:text-[#4FD1C5] ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-white/10 text-gray-200 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FlagIcon code={locale} />
                <span>{locale.toUpperCase()}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 ${
                      isDark ? 'bg-[#1a2535] border-white/10' : 'bg-white border-gray-100'
                    }`}
                  >
                    {languages.map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLocale(l); setLangOpen(false); }}
                        className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-3 ${
                          locale === l
                            ? 'text-[#0D6D6E] dark:text-[#4FD1C5] bg-[#0D6D6E]/10 dark:bg-[#4FD1C5]/10 font-semibold'
                            : isDark
                            ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <FlagIcon code={l} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {languageFullNames[l]}
                          </span>
                          <span className={`text-xs ${
                            locale === l
                              ? 'text-[#0D6D6E]/70 dark:text-[#4FD1C5]/70'
                              : isDark
                              ? 'text-gray-500'
                              : 'text-gray-400'
                          }`}>
                            {l.toUpperCase()}
                          </span>
                        </div>
                        {locale === l && (
                          <svg 
                            className="w-5 h-5 ml-auto text-[#0D6D6E] dark:text-[#4FD1C5]" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth buttons */}
            <Link
              href="/login?mode=login"
              className={`hidden sm:block px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isDark
                  ? 'text-gray-200 hover:text-[#4FD1C5] hover:bg-white/10'
                  : 'text-gray-700 hover:text-[#0D6D6E] hover:bg-gray-100'
              }`}
            >
              {t.header.auth.login}
            </Link>
            <Link
              href="/login?mode=register"
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl hover:shadow-lg hover:shadow-[#0D6D6E]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              {t.header.auth.register}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
