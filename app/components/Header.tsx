'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const languages = ['RU', 'KR', 'EN'];

export default function Header() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState('RU');
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [dark]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? dark
            ? 'bg-[#0f1923]/95 backdrop-blur-md shadow-lg shadow-black/30'
            : 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/10'
          : dark
          ? 'bg-transparent'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-[#4FD1C5]/40 transition-shadow duration-300">
              <Image
                src="/logo.png"
                alt="FamilyPay"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              FamilyPay
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {['Возможности', 'Тарифы', 'Контакты'].map((item, i) => (
              <Link
                key={i}
                href={i === 0 ? '#features' : i === 1 ? '#pricing' : '#contact'}
                className={`text-sm font-medium transition-colors duration-200 hover:text-[#4FD1C5] ${
                  dark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {item}
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
                  dark
                    ? 'bg-white/10 text-gray-200 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>🌐</span>
                <span>{lang}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div
                  className={`absolute right-0 mt-2 w-24 rounded-xl shadow-xl border overflow-hidden z-50 ${
                    dark ? 'bg-[#1a2535] border-white/10' : 'bg-white border-gray-100'
                  }`}
                >
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-sm font-medium text-left transition-colors duration-150 ${
                        lang === l
                          ? 'text-[#4FD1C5] bg-[#4FD1C5]/10'
                          : dark
                          ? 'text-gray-300 hover:bg-white/10'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {l === 'RU' ? '🇷🇺 RU' : l === 'KR' ? '🇰🇬 KR' : '🇬🇧 EN'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                dark
                  ? 'bg-[#4FD1C5]/20 text-[#4FD1C5] hover:bg-[#4FD1C5]/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Auth buttons */}
            <Link
              href="/login"
              className={`hidden sm:block px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                dark
                  ? 'text-gray-200 hover:text-[#4FD1C5] hover:bg-white/10'
                  : 'text-gray-700 hover:text-[#0D6D6E] hover:bg-gray-100'
              }`}
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl hover:shadow-lg hover:shadow-[#4FD1C5]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Регистрация
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
