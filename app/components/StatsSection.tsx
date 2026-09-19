'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const stats = [
  { value: '10K+', label: 'Активных пользователей' },
  { value: '500K+', label: 'Транзакций в месяц' },
  { value: '98%', label: 'Довольных клиентов' },
  { value: '24/7', label: 'Поддержка' },
];

export function StatsSection() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const bgLight =
    'linear-gradient(to bottom, #ffffff 0%, #ccf0ed 18%, #0D9488 40%, #0D6D6E 50%, #0D9488 60%, #ccf0ed 82%, #f9fafb 100%)';
  const bgDark =
    'linear-gradient(to bottom, #111d2b 0%, #0d2030 18%, #0D9488 40%, #0D6D6E 50%, #0D9488 60%, #0d2030 82%, #0f1923 100%)';

  return (
    <section className="py-40 transition-all duration-500" style={{ background: dark ? bgDark : bgLight }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center text-white">
          {stats.map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black drop-shadow-lg">{s.value}</div>
              <div className="text-teal-100 text-xs sm:text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const bgLight =
    'linear-gradient(to bottom, #f9fafb 0%, #ccf0ed 14%, #0D6D6E 36%, #0e8a7a 64%, #ccf0ed 86%, #111827 100%)';
  const bgDark =
    'linear-gradient(to bottom, #0f1923 0%, #0d2030 14%, #0D6D6E 36%, #0e8a7a 64%, #0d2030 86%, #080d12 100%)';

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden transition-all duration-500" style={{ background: dark ? bgDark : bgLight }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white blur-3xl" />
      </div>
      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Начните управлять финансами сегодня
        </h2>
        <p className="text-lg sm:text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
          Присоединяйтесь к тысячам семей, которые уже контролируют свой бюджет с FamilyPay
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 bg-white text-[#0D6D6E] rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          Создать семейный бюджет
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
