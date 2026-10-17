'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1923]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Назад на главную</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Условия использования
            </h1>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none">
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                1. Принятие условий
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Добро пожаловать в FamilyPay! Эти Условия использования ("Условия") регулируют ваш доступ и использование платформы FamilyPay, включая веб-сайт, мобильные приложения и связанные услуги (совместно именуемые "Сервис"). Используя наш Сервис, вы соглашаетесь соблюдать эти Условия. Если вы не согласны с какой-либо частью условий, пожалуйста, не используйте наш Сервис.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                2. Описание сервиса
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              FamilyPay — это платформа для управления семейными финансами, которая предоставляет:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Инструменты для отслеживания доходов и расходов</li>
              <li>Управление семейными счетами и бюджетами</li>
              <li>Систему финансовых целей и накоплений</li>
              <li>Функционал для управления запросами на расходы</li>
              <li>AI-ассистент для финансового планирования</li>
              <li>Образовательные материалы по финансовой грамотности</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                3. Регистрация и учетная запись
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Для использования Сервиса вы должны:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Быть не моложе 18 лет или иметь согласие родителей/опекунов</li>
              <li>Предоставить точную, актуальную и полную информацию при регистрации</li>
              <li>Поддерживать безопасность вашей учетной записи и пароля</li>
              <li>Немедленно уведомлять нас о любом несанкционированном использовании</li>
              <li>Нести ответственность за всю активность в вашей учетной записи</li>
            </ul>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              Мы оставляем за собой право приостановить или прекратить действие учетной записи при нарушении этих Условий.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                4. Использование сервиса
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              При использовании FamilyPay вы соглашаетесь:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li><strong>Не использовать</strong> Сервис для незаконных целей</li>
              <li><strong>Не нарушать</strong> права интеллектуальной собственности</li>
              <li><strong>Не передавать</strong> вредоносное программное обеспечение</li>
              <li><strong>Не пытаться</strong> получить несанкционированный доступ к системе</li>
              <li><strong>Не создавать</strong> фальшивые учетные записи</li>
              <li><strong>Не использовать</strong> Сервис для спама или мошенничества</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                5. Финансовая информация
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              FamilyPay является инструментом для управления финансами, но НЕ является:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Финансовым консультантом или советником</li>
              <li>Банком или финансовым учреждением</li>
              <li>Заменой профессиональной финансовой консультации</li>
            </ul>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              Все финансовые данные, вводимые в систему, являются вашей ответственностью. Мы не несем ответственности за точность финансовой информации или последствия финансовых решений, принятых на основе использования Сервиса.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                6. Интеллектуальная собственность
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Все права на Сервис, включая, но не ограничиваясь, дизайн, текст, графику, логотипы, иконки, изображения, аудио- и видеоклипы, программное обеспечение и другой контент, принадлежат FamilyPay или его лицензиарам. Несанкционированное использование материалов запрещено.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                7. Ограничение ответственности
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              FamilyPay предоставляется "как есть" без каких-либо гарантий. Мы не несем ответственности за:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Прямые, косвенные или случайные убытки</li>
              <li>Потерю данных или прибыли</li>
              <li>Прерывание работы Сервиса</li>
              <li>Ошибки или неточности в контенте</li>
              <li>Действия третьих лиц</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                8. Оплата и подписки
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              FamilyPay может предлагать бесплатные и платные планы. Условия подписки:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Платежи обрабатываются безопасными платежными системами</li>
              <li>Подписка продлевается автоматически, если не отменена</li>
              <li>Возврат средств осуществляется в соответствии с нашей политикой</li>
              <li>Мы можем изменять цены с уведомлением за 30 дней</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                9. Прекращение использования
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Вы можете прекратить использование Сервиса в любое время, удалив свою учетную запись. Мы можем прекратить или приостановить ваш доступ немедленно при нарушении Условий, без предварительного уведомления.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                10. Изменения условий
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Мы оставляем за собой право изменять эти Условия в любое время. О существенных изменениях мы уведомим вас через Сервис или по электронной почте. Продолжение использования после изменений означает ваше согласие с новыми Условиями.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                11. Применимое право
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Эти Условия регулируются законодательством [Страны/Региона]. Любые споры подлежат рассмотрению в судах [Юрисдикции].
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                12. Контактная информация
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Если у вас есть вопросы об этих Условиях, свяжитесь с нами:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li><strong>Email:</strong> support@familypay.com</li>
              <li><strong>Адрес:</strong> [Адрес компании]</li>
              <li><strong>Телефон:</strong> [Телефон поддержки]</li>
            </ul>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] rounded-xl sm:rounded-2xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Согласны с условиями?
          </h3>
          <p className="text-sm sm:text-base text-white/90 mb-3 sm:mb-4">
            Начните управлять семейными финансами с FamilyPay
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-[#0D6D6E] rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
