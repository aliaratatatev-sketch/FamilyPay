import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import { StatsSection, CtaSection } from "./components/StatsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1923] transition-colors duration-300">
      <Header />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-white to-cyan-50/40 dark:from-[#0f1923] dark:via-[#111d2b] dark:to-[#0d2030] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">

            {/* Left */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 rounded-full text-xs sm:text-sm font-medium text-[#0D6D6E] dark:text-[#4FD1C5]">
                <span className="w-2 h-2 rounded-full bg-[#4FD1C5] animate-pulse flex-shrink-0" />
                Новый уровень семейных финансов
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Семейный бюджет{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
                    под контролем
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="url(#ul)" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <defs>
                      <linearGradient id="ul" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0D6D6E" />
                        <stop offset="100%" stopColor="#4FD1C5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                Управляйте финансами всей семьи в одном приложении. Планируйте
                бюджет, достигайте целей и следите за расходами вместе.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-2xl font-semibold text-sm sm:text-base shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  Начать бесплатно
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-[#0D6D6E]/30 dark:border-[#4FD1C5]/30 text-[#0D6D6E] dark:text-[#4FD1C5] rounded-2xl font-semibold text-sm sm:text-base hover:border-[#0D6D6E] dark:hover:border-[#4FD1C5] hover:bg-[#0D6D6E]/5 dark:hover:bg-[#4FD1C5]/5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Смотреть демо
                </Link>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 pt-2">
                <div className="flex -space-x-2">
                  {["#0D6D6E","#4FD1C5","#10B981","#059669"].map((c,i)=>(
                    <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white dark:border-[#0f1923] flex items-center justify-center text-white text-xs font-bold" style={{background:c}}>
                      {["А","М","Д","С"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">10 000+</span> семей уже используют FamilyPay
                </p>
              </div>
            </div>

            {/* Right — video */}
            <div className="relative flex items-center justify-center order-1 lg:order-2">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#0D6D6E]/20 to-[#4FD1C5]/20 rounded-3xl blur-2xl" />
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-teal-500/20 border border-white/20 dark:border-white/5">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ maxHeight: "520px" }}>
                  <source src="/istockphoto-2063356537-640_adpp_is.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1.5">FamilyPay</p>
                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-snug drop-shadow-lg">
                    Достигайте финансовых целей{" "}
                    <span className="bg-gradient-to-r from-[#4FD1C5] to-[#a7f3d0] bg-clip-text text-transparent">
                      всей семьёй
                    </span>
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-2 leading-relaxed">
                    Планируйте, копите и контролируйте — вместе это проще
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-white dark:bg-[#111d2b] transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5] text-sm font-semibold rounded-full border border-[#4FD1C5]/20">
              Возможности
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white px-4">
              Всё для управления семейными финансами
            </h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-4">
              Мощные инструменты для контроля бюджета и достижения финансовых целей
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0f1923] hover:border-[#4FD1C5]/40 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4FD1C5]/0 to-[#0D6D6E]/0 group-hover:from-[#4FD1C5]/5 group-hover:to-[#0D6D6E]/5 transition-all duration-500 rounded-3xl" />
                <span className="absolute top-5 right-5 text-4xl sm:text-5xl font-black text-gray-50 dark:text-white/[0.04] select-none">
                  0{i + 1}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mb-5 sm:mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl">{f.emoji}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS (клиентский — адаптируется к теме) ─────────────────── */}
      <StatsSection />

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-gray-50 dark:bg-[#0f1923] transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5] text-sm font-semibold rounded-full border border-[#4FD1C5]/20">
              Тарифы
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Простые и прозрачные тарифы
            </h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              Выберите план, который подходит вашей семье
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            <PricingCard
              name="Базовый"
              price="Бесплатно"
              features={["До 3 членов семьи", "5 финансовых счетов", "Базовая аналитика", "3 активных бюджета"]}
              cta="Начать"
              href="/register"
              popular={false}
            />
            <PricingCard
              name="Семейный"
              price="499 сом"
              period="/месяц"
              features={["До 10 членов семьи", "Неограниченно счетов", "Расширенная аналитика", "Неограниченно бюджетов и целей", "Повторяющиеся транзакции", "Приоритетная поддержка"]}
              cta="Попробовать бесплатно"
              href="/register"
              popular={true}
            />
            <PricingCard
              name="Премиум"
              price="999 сом"
              period="/месяц"
              features={["Неограниченно членов", "Все возможности Семейного", "AI-аналитика расходов", "Персональный менеджер", "API доступ"]}
              cta="Связаться с нами"
              href="/contact"
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA (клиентский — адаптируется к теме) ──────────────────── */}
      <CtaSection />

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer id="contact" className="relative bg-[#0a1628] text-gray-400 pt-14 sm:pt-16 pb-8 overflow-hidden transition-colors duration-300">
        {/* фоновое изображение — логотип + надпись FamilyPay снизу по центру */}
        <div
          className="absolute bottom-0 left-0 right-0 h-full bg-no-repeat bg-bottom bg-contain pointer-events-none select-none"
          style={{
            backgroundImage: "url('/фон фут.png')",
            opacity: 0.18,
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12">
            {/* brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <Image src="/logo.png" alt="FamilyPay Logo" width={32} height={32} className="w-8 h-8" />
                <span className="text-xl font-bold text-white">FamilyPay</span>
              </Link>
              <p className="text-sm leading-relaxed mb-5">
                Современное решение для управления семейным бюджетом
              </p>
              <div className="flex gap-2.5">
                {[{ icon: "𝕏", label: "Twitter" }, { icon: "in", label: "LinkedIn" }, { icon: "▶", label: "YouTube" }].map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#4FD1C5]/20 hover:text-[#4FD1C5] flex items-center justify-center text-xs font-bold transition-colors duration-200"
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* product */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Продукт</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="#features" className="hover:text-[#4FD1C5] transition-colors">Возможности</Link></li>
                <li><Link href="#pricing" className="hover:text-[#4FD1C5] transition-colors">Тарифы</Link></li>
                <li><Link href="#demo" className="hover:text-[#4FD1C5] transition-colors">Демо</Link></li>
              </ul>
            </div>

            {/* company */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Компания</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/about" className="hover:text-[#4FD1C5] transition-colors">О нас</Link></li>
                <li><Link href="/blog" className="hover:text-[#4FD1C5] transition-colors">Блог</Link></li>
                <li><Link href="/careers" className="hover:text-[#4FD1C5] transition-colors">Карьера</Link></li>
              </ul>
            </div>

            {/* contacts */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Контакты</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2"><span>✉️</span><span>support@familypay.kg</span></li>
                <li className="flex items-start gap-2"><span>📞</span><span>+996 (312) 12-34-56</span></li>
                <li className="flex items-start gap-2"><span>📍</span><span>Бишкек, Кыргызстан</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <p>© 2026 FamilyPay. Все права защищены.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-[#4FD1C5] transition-colors">Политика конфиденциальности</Link>
              <Link href="/terms" className="hover:text-[#4FD1C5] transition-colors">Условия использования</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Feature data ──────────────────────────────────────────────
const features = [
  { emoji: "👨‍👩‍👧‍👦", title: "Совместный доступ", desc: "Добавляйте членов семьи с разными уровнями доступа. Каждый видит общую картину финансов." },
  { emoji: "📊", title: "Аналитика расходов", desc: "Детальная статистика по категориям. Понимайте, на что уходят деньги и оптимизируйте траты." },
  { emoji: "🎯", title: "Бюджеты и лимиты", desc: "Планируйте расходы по категориям. Получайте уведомления при превышении лимитов." },
  { emoji: "💳", title: "Множество счетов", desc: "Наличные, карты, сбережения, инвестиции — управляйте всеми счетами в одном месте." },
  { emoji: "🚀", title: "Финансовые цели", desc: "Копите на отпуск, автомобиль или образование. Отслеживайте прогресс достижения целей." },
  { emoji: "🔄", title: "Автоматизация", desc: "Настройте повторяющиеся транзакции. Зарплата, платежи и подписки добавляются автоматически." },
];

// ─── Pricing card ──────────────────────────────────────────────
function PricingCard({ name, price, period, features, cta, href, popular }: {
  name: string; price: string; period?: string;
  features: string[]; cta: string; href: string; popular: boolean;
}) {
  return (
    <div className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
      popular
        ? "bg-gradient-to-b from-[#0D6D6E] to-[#0a5758] text-white shadow-2xl shadow-teal-700/40 sm:scale-105"
        : "bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-teal-500/10"
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#4FD1C5] to-[#38bdf8] text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
          ⭐ Популярный
        </div>
      )}
      <div className="mb-5 sm:mb-6">
        <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${popular ? "text-white" : "text-gray-900 dark:text-white"}`}>{name}</h3>
        <div className="flex items-end gap-1">
          <span className={`text-3xl sm:text-4xl font-black ${popular ? "text-white" : "text-gray-900 dark:text-white"}`}>{price}</span>
          {period && <span className={`text-sm mb-1 ${popular ? "text-teal-200" : "text-gray-400"}`}>{period}</span>}
        </div>
      </div>
      <ul className="space-y-2.5 sm:space-y-3 mb-7 sm:mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 sm:gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#4FD1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-sm ${popular ? "text-teal-100" : "text-gray-600 dark:text-gray-400"}`}>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className={`block w-full py-3 sm:py-3.5 text-center rounded-xl sm:rounded-2xl font-bold text-sm transition-all duration-300 ${
        popular
          ? "bg-white text-[#0D6D6E] hover:bg-teal-50 hover:shadow-lg"
          : "border-2 border-[#0D6D6E]/30 dark:border-[#4FD1C5]/30 text-[#0D6D6E] dark:text-[#4FD1C5] hover:border-[#0D6D6E] dark:hover:border-[#4FD1C5] hover:bg-[#0D6D6E]/5 dark:hover:bg-[#4FD1C5]/5"
      }`}>
        {cta}
      </Link>
    </div>
  );
}
