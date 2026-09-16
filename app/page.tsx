import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="FamilyPay Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              FamilyPay
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-[#0D6D6E] transition-colors">
              Возможности
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-[#0D6D6E] transition-colors">
              Тарифы
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-[#0D6D6E] transition-colors">
              Контакты
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-full hover:shadow-lg transition-all"
            >
              Войти
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Семейный бюджет под{" "}
              <span className="bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
                контролем
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Управляйте финансами всей семьи в одном приложении. Планируйте бюджет, достигайте целей и следите за расходами вместе.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/register" 
                className="px-8 py-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-full font-semibold hover:shadow-xl transition-all"
              >
                Начать бесплатно
              </Link>
              <Link 
                href="#demo" 
                className="px-8 py-4 border-2 border-[#0D6D6E] text-[#0D6D6E] rounded-full font-semibold hover:bg-[#0D6D6E] hover:text-white transition-all"
              >
                Смотреть демо
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full h-[500px] bg-gradient-to-br from-[#0D6D6E]/10 to-[#4FD1C5]/10 rounded-3xl flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="FamilyPay - Семейный бюджет" 
                width={400} 
                height={400}
                className="w-80 h-80 object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Всё для управления семейными финансами
            </h2>
            <p className="text-xl text-gray-600">
              Мощные инструменты для контроля бюджета и достижения финансовых целей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-[#4FD1C5] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Совместный доступ</h3>
              <p className="text-gray-600">
                Добавляйте членов семьи с разными уровнями доступа. Каждый видит общую картину финансов.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-[#4FD1C5] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Аналитика расходов</h3>
              <p className="text-gray-600">
                Детальная статистика по категориям. Понимайте, на что уходят деньги и оптимизируйте траты.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-[#4FD1C5] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Бюджеты и лимиты</h3>
              <p className="text-gray-600">
                Планируйте расходы по категориям. Получайте уведомления при превышении лимитов.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-[#4FD1C5] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Множество счетов</h3>
              <p className="text-gray-600">
                Наличные, карты, сбережения, инвестиции — управляйте всеми счетами в одном месте.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-[#4FD1C5] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Финансовые цели</h3>
              <p className="text-gray-600">
                Копите на отпуск, автомобиль или образование. Отслеживайте прогресс достижения целей.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl border border-gray-100 hover:border-[#4FD1C5] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Автоматизация</h3>
              <p className="text-gray-600">
                Настройте повторяющиеся транзакции. Зарплата, платежи и подписки будут добавляться автоматически.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-teal-100">Активных пользователей</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500K+</div>
              <div className="text-teal-100">Транзакций в месяц</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-teal-100">Довольных клиентов</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-teal-100">Поддержка</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Простые и прозрачные тарифы
            </h2>
            <p className="text-xl text-gray-600">
              Выберите план, который подходит вашей семье
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-[#4FD1C5] transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Базовый</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Бесплатно</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">До 3 членов семьи</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">5 финансовых счетов</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Базовая аналитика</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">3 активных бюджета</span>
                </li>
              </ul>
              <Link 
                href="/register" 
                className="block w-full py-3 text-center border-2 border-[#0D6D6E] text-[#0D6D6E] rounded-full font-semibold hover:bg-[#0D6D6E] hover:text-white transition-all"
              >
                Начать
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-[#4FD1C5] shadow-xl relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Популярный
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Семейный</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₽499</span>
                <span className="text-gray-500">/месяц</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">До 10 членов семьи</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Неограниченно счетов</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Расширенная аналитика</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Неограниченно бюджетов и целей</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Повторяющиеся транзакции</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Приоритетная поддержка</span>
                </li>
              </ul>
              <Link 
                href="/register" 
                className="block w-full py-3 text-center bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-full font-semibold hover:shadow-xl transition-all"
              >
                Попробовать бесплатно
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-[#4FD1C5] transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Премиум</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₽999</span>
                <span className="text-gray-500">/месяц</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Неограниченно членов</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Все возможности Семейного</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">AI-аналитика расходов</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Персональный менеджер</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#4FD1C5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">API доступ</span>
                </li>
              </ul>
              <Link 
                href="/contact" 
                className="block w-full py-3 text-center border-2 border-[#0D6D6E] text-[#0D6D6E] rounded-full font-semibold hover:bg-[#0D6D6E] hover:text-white transition-all"
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Начните управлять финансами сегодня
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам семей, которые уже контролируют свой бюджет с FamilyPay
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-4 bg-white text-[#0D6D6E] rounded-full font-semibold hover:shadow-xl transition-all"
          >
            Создать семейный бюджет
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image 
                  src="/logo.png" 
                  alt="FamilyPay Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-white">FamilyPay</span>
              </Link>
              <p className="text-sm">
                Современное решение для управления семейным бюджетом
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-[#4FD1C5]">Возможности</Link></li>
                <li><Link href="#pricing" className="hover:text-[#4FD1C5]">Тарифы</Link></li>
                <li><Link href="#demo" className="hover:text-[#4FD1C5]">Демо</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Компания</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-[#4FD1C5]">О нас</Link></li>
                <li><Link href="/blog" className="hover:text-[#4FD1C5]">Блог</Link></li>
                <li><Link href="/careers" className="hover:text-[#4FD1C5]">Карьера</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm">
                <li>support@familypay.ru</li>
                <li>+7 (495) 123-45-67</li>
                <li>Москва, Россия</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 FamilyPay. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
