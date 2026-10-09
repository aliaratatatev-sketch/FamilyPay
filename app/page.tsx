'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import AuthAwareLink from "./components/AuthAwareLink";
import { useLocale } from "./i18n/LocaleContext";
import RequestApprovalCard from "./components/RequestApprovalCard";
import VideoModal from "./components/VideoModal";

export default function Home() {
  const { t } = useLocale();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1923] transition-colors duration-300">
      <Header />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] md:min-h-screen flex items-center pt-20 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-white to-cyan-50/40 dark:from-[#0f1923] dark:via-[#111d2b] dark:to-[#0d2030] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-10 xl:gap-16 items-center">

            {/* Left */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 rounded-full text-xs sm:text-sm font-medium text-[#0D6D6E] dark:text-[#4FD1C5]">
                <span className="w-2 h-2 rounded-full bg-[#4FD1C5] animate-pulse flex-shrink-0" />
                {t.hero.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {t.hero.title.part1}{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
                    {t.hero.title.part2}
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

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <AuthAwareLink
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 active:scale-95 transition-all duration-300"
                >
                  {t.hero.cta.primary}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </AuthAwareLink>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-[#0D6D6E]/30 dark:border-[#4FD1C5]/30 text-[#0D6D6E] dark:text-[#4FD1C5] rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:border-[#0D6D6E] dark:hover:border-[#4FD1C5] hover:bg-[#0D6D6E]/5 dark:hover:bg-[#4FD1C5]/5 active:scale-95 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {t.hero.cta.secondary}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 pt-2">
                <div className="flex -space-x-2">
                  {["#0D6D6E","#4FD1C5","#10B981"].map((c,i)=>(
                    <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-[#0f1923] flex items-center justify-center text-white text-xs font-bold" style={{background:c}} title={t.hero.social_proof.roles[i]}>
                      {t.hero.social_proof.roles[i].charAt(0)}
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t.hero.social_proof.text}
                </p>
              </div>
            </div>

            {/* Right — карточка модерации запроса */}
            <div className="relative flex items-center justify-center order-1 lg:order-2 mb-4 lg:mb-0">
              <div className="w-full max-w-md">
                <RequestApprovalCard />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ABOUT ─────────────────────────────────────────────────────── */}
      <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-[#111d2b] transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1.5 sm:px-4 bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5] text-xs sm:text-sm font-semibold rounded-full border border-[#4FD1C5]/20">
              {t.about.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white px-4">
              {t.about.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t.about.description}
            </p>
          </div>

          {/* Mission */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] text-white shadow-2xl shadow-teal-500/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl">🎯</span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{t.about.mission.title}</h3>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-teal-50 leading-relaxed">
              {t.about.mission.text}
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t.about.values.map((value, i) => (
              <div
                key={i}
                className="group relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0f1923] hover:border-[#4FD1C5]/40 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mb-3 sm:mb-4 md:mb-5 shadow-lg shadow-teal-500/30">
                  <span className="text-xl sm:text-2xl">{value.emoji}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-[#0f1923] transition-colors duration-300 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5 dark:opacity-[0.02]">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#4FD1C5] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0D6D6E] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1.5 sm:px-4 bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5] text-xs sm:text-sm font-semibold rounded-full border border-[#4FD1C5]/20">
              {t.howItWorks.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white px-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-4">
              {t.howItWorks.description}
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0D6D6E] via-[#4FD1C5] to-[#0D6D6E] -translate-y-1/2 opacity-20" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                {t.howItWorks.steps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:border-[#4FD1C5]/40 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 group">
                      {/* Step number */}
                      <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <span className="text-white font-black text-base sm:text-lg">{step.number}</span>
                      </div>
                      
                      {/* Icon */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#4FD1C5]/10 to-[#0D6D6E]/10 dark:from-[#4FD1C5]/20 dark:to-[#0D6D6E]/20 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 border border-[#4FD1C5]/20">
                        <span className="text-2xl sm:text-3xl md:text-4xl">{step.icon}</span>
                      </div>
                      
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{step.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus */}
            <div className="mt-8 sm:mt-12 md:mt-16 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#0D6D6E]/5 to-[#4FD1C5]/5 border border-[#4FD1C5]/20 dark:border-[#4FD1C5]/10">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center shadow-lg shadow-teal-500/30 flex-shrink-0">
                  <span className="text-xl sm:text-2xl">✨</span>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">{t.howItWorks.bonus.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">{t.howItWorks.bonus.text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-[#111d2b] transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1.5 sm:px-4 bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5] text-xs sm:text-sm font-semibold rounded-full border border-[#4FD1C5]/20">
              {t.features.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white px-4">
              {t.features.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-4">
              {t.features.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {t.features.items.map((f, i) => (
              <div
                key={i}
                className="group relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0f1923] hover:border-[#4FD1C5]/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4FD1C5]/0 to-[#0D6D6E]/0 hover:from-[#4FD1C5]/5 hover:to-[#0D6D6E]/5 transition-all duration-500 rounded-3xl" />
                <span className="absolute top-4 sm:top-5 right-4 sm:right-5 text-3xl sm:text-4xl md:text-5xl font-black text-gray-50 dark:text-white/[0.04] select-none">
                  0{i + 1}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg shadow-teal-500/30">
                    <span className="text-lg sm:text-xl md:text-2xl">{f.emoji}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {t.stats.items.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-3 md:mb-4">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-lg text-teal-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-[#0f1923] transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1.5 sm:px-4 bg-[#4FD1C5]/10 text-[#0D6D6E] dark:text-[#4FD1C5] text-xs sm:text-sm font-semibold rounded-full border border-[#4FD1C5]/20">
              {t.pricing.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white px-4">
              {t.pricing.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 px-4">
              {t.pricing.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto items-start">
            {t.pricing.plans.map((plan, idx) => (
              <PricingCard
                key={idx}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                cta={plan.cta}
                href={plan.name === t.pricing.plans[2].name ? "/contact" : "/register"}
                popular={plan.popular}
                badge={plan.popular ? plan.badge : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-br from-[#0D6D6E]/5 via-[#4FD1C5]/5 to-[#10B981]/5 dark:from-[#0D6D6E]/10 dark:via-[#4FD1C5]/10 dark:to-[#10B981]/10 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white px-4">
              {t.cta.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t.cta.description}
            </p>
            <AuthAwareLink
              className="inline-flex items-center justify-center gap-2 sm:gap-3 min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg shadow-2xl shadow-teal-500/40 hover:shadow-3xl hover:shadow-teal-500/50 active:scale-95 transition-all duration-300"
            >
              {t.cta.button}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </AuthAwareLink>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer id="contact" className="relative bg-[#0a1628] text-gray-400 pt-10 sm:pt-12 md:pt-14 lg:pt-16 pb-6 sm:pb-8 overflow-hidden transition-colors duration-300">
        {/* фоновое изображение — логотип + надпись FamilyPay снизу по центру */}
        <div
          className="absolute bottom-0 left-0 right-0 h-full bg-no-repeat bg-bottom bg-contain pointer-events-none select-none"
          style={{
            backgroundImage: "url('/фон фут.png')",
            opacity: 0.18,
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 pb-8 sm:pb-10 md:pb-12">
            {/* brand */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                <Image src="/logo.png" alt="FamilyPay Logo" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-lg sm:text-xl font-bold text-white">{t.footer.brand.name}</span>
              </Link>
              <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                {t.footer.brand.description}
              </p>
              <div className="flex gap-2 sm:gap-2.5">
                {[
                  { icon: "𝕏", label: t.footer.social.twitter },
                  { icon: "in", label: t.footer.social.linkedin },
                  { icon: "▶", label: t.footer.social.youtube }
                ].map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="min-w-[44px] min-h-[44px] w-9 h-9 rounded-lg sm:rounded-xl bg-white/10 hover:bg-[#0D6D6E]/80 hover:text-white flex items-center justify-center text-xs font-bold transition-colors duration-200 active:scale-95"
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* product */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">{t.footer.sections.product.title}</h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                {t.footer.sections.product.links.map((link, i) => (
                  <li key={i}><Link href={link.href} className="hover:text-[#0D6D6E] transition-colors inline-block min-h-[44px] flex items-center">{link.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* company */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">{t.footer.sections.company.title}</h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                {t.footer.sections.company.links.map((link, i) => (
                  <li key={i}><Link href={link.href} className="hover:text-[#0D6D6E] transition-colors inline-block min-h-[44px] flex items-center">{link.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* contacts */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">{t.footer.sections.contacts.title}</h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2"><span>✉️</span><span>{t.footer.sections.contacts.email}</span></li>
                <li className="flex items-start gap-2"><span>📞</span><span>{t.footer.sections.contacts.phone}</span></li>
                <li className="flex items-start gap-2"><span>📍</span><span>{t.footer.sections.contacts.address}</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-5 sm:pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
            <p className="text-center sm:text-left">{t.footer.bottom.copyright}</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
              <Link href="/privacy" className="hover:text-[#0D6D6E] transition-colors min-h-[44px] inline-flex items-center">{t.footer.bottom.privacy}</Link>
              <Link href="/terms" className="hover:text-[#0D6D6E] transition-colors min-h-[44px] inline-flex items-center">{t.footer.bottom.terms}</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── VIDEO MODAL ──────────────────────────────────────────────── */}
      <VideoModal 
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="/gemini_generated_video_aa514352.mp4"
      />
    </div>
  );
}

// ─── Pricing card ──────────────────────────────────────────────
function PricingCard({ name, price, period, features, cta, href, popular, badge }: {
  name: string; price: string; period?: string;
  features: string[]; cta: string; href: string; popular: boolean; badge?: string;
}) {
  return (
    <div className={`relative rounded-xl sm:rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col transition-all duration-300 ${
      popular
        ? "bg-gradient-to-b from-[#0D6D6E] to-[#0a5758] text-white shadow-2xl shadow-teal-700/40 sm:scale-105"
        : "bg-white dark:bg-[#111d2b] border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-teal-500/10"
    }`}>
      {popular && badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 sm:px-4 bg-gradient-to-r from-[#4FD1C5] to-[#38bdf8] text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
          {badge}
        </div>
      )}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-2 ${popular ? "text-white" : "text-gray-900 dark:text-white"}`}>{name}</h3>
        <div className="flex items-end gap-1">
          <span className={`text-2xl sm:text-3xl md:text-4xl font-black ${popular ? "text-white" : "text-gray-900 dark:text-white"}`}>{price}</span>
          {period && <span className={`text-xs sm:text-sm mb-1 ${popular ? "text-teal-200" : "text-gray-400"}`}>{period}</span>}
        </div>
      </div>
      <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-5 sm:mb-6 md:mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-[#4FD1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-xs sm:text-sm ${popular ? "text-teal-100" : "text-gray-600 dark:text-gray-400"}`}>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className={`block w-full min-h-[44px] py-3 sm:py-3.5 text-center rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center ${
        popular
          ? "bg-white text-[#0D6D6E] hover:bg-teal-50 hover:shadow-lg active:scale-95"
          : "border-2 border-[#0D6D6E]/30 dark:border-[#4FD1C5]/30 text-[#0D6D6E] dark:text-[#4FD1C5] hover:border-[#0D6D6E] dark:hover:border-[#4FD1C5] hover:bg-[#0D6D6E]/5 dark:hover:bg-[#4FD1C5]/5 active:scale-95"
      }`}>
        {cta}
      </Link>
    </div>
  );
}
