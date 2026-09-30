'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { Locale, localeNames } from '../i18n';
import ThemeToggle from './ThemeToggle';

const languages: Locale[] = ['ru', 'kg', 'en'];

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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-white/10 text-gray-200 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>🌐</span>
                <span>{locale.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${
                    isDark ? 'bg-[#1a2535] border-white/10' : 'bg-white border-gray-100'
                  }`}
                >
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
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
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth buttons */}
            <Link
              href="/login"
              className={`hidden sm:block px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isDark
                  ? 'text-gray-200 hover:text-[#4FD1C5] hover:bg-white/10'
                  : 'text-gray-700 hover:text-[#0D6D6E] hover:bg-gray-100'
              }`}
            >
              {t.header.auth.login}
            </Link>
            <Link
              href="/login"
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
