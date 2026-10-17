'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
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
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Политика конфиденциальности
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
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                1. Введение
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              FamilyPay ("мы", "нас", "наш") обязуется защищать конфиденциальность пользователей нашего приложения для управления семейными финансами. Эта Политика конфиденциальности объясняет, как мы собираем, используем, раскрываем и защищаем вашу информацию при использовании нашего сервиса.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                2. Собираемая информация
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Мы собираем следующие типы информации:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li><strong>Личная информация:</strong> имя, адрес электронной почты, номер телефона</li>
              <li><strong>Финансовая информация:</strong> данные о счетах, транзакциях, бюджетах и финансовых целях</li>
              <li><strong>Семейная информация:</strong> информация о членах семьи и их ролях в приложении</li>
              <li><strong>Техническая информация:</strong> IP-адрес, тип устройства, браузер, операционная система</li>
              <li><strong>Информация об использовании:</strong> данные о взаимодействии с приложением</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                3. Использование информации
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Мы используем собранную информацию для:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Предоставления и поддержки функциональности приложения</li>
              <li>Обработки транзакций и управления финансовыми данными</li>
              <li>Персонализации пользовательского опыта</li>
              <li>Отправки уведомлений и важной информации</li>
              <li>Улучшения безопасности и предотвращения мошенничества</li>
              <li>Анализа использования приложения и его улучшения</li>
              <li>Соблюдения юридических обязательств</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                4. Защита данных
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Мы применяем современные технические и организационные меры безопасности для защиты ваших данных:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Шифрование данных при передаче (SSL/TLS)</li>
              <li>Шифрование чувствительных данных в базе данных</li>
              <li>Регулярные проверки безопасности и аудит</li>
              <li>Ограниченный доступ к данным только авторизованному персоналу</li>
              <li>Двухфакторная аутентификация для дополнительной защиты</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                5. Раскрытие информации
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Мы не продаем, не обмениваем и не передаем вашу личную информацию третьим лицам без вашего согласия, за исключением следующих случаев:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Когда это требуется по закону или в ответ на судебные запросы</li>
              <li>Для защиты наших прав, собственности или безопасности</li>
              <li>С доверенными партнерами, которые помогают в работе приложения (с обязательством конфиденциальности)</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                6. Ваши права
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Вы имеете следующие права в отношении ваших персональных данных:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li><strong>Право на доступ:</strong> запрос копии хранящихся данных</li>
              <li><strong>Право на исправление:</strong> обновление неточной или неполной информации</li>
              <li><strong>Право на удаление:</strong> запрос на удаление ваших данных</li>
              <li><strong>Право на ограничение:</strong> ограничение обработки ваших данных</li>
              <li><strong>Право на переносимость:</strong> получение данных в структурированном формате</li>
              <li><strong>Право на возражение:</strong> возражение против обработки данных</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                7. Cookies и технологии отслеживания
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Мы используем cookies и аналогичные технологии для улучшения работы приложения, анализа использования и персонализации контента. Вы можете управлять настройками cookies в своем браузере.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                8. Хранение данных
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Мы храним вашу информацию только до тех пор, пока это необходимо для предоставления услуг и соблюдения законодательства. Финансовые записи хранятся в соответствии с требованиями регулирующих органов.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                9. Изменения в политике
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Мы можем периодически обновлять эту Политику конфиденциальности. О существенных изменениях мы уведомим вас по электронной почте или через уведомление в приложении. Продолжение использования сервиса после изменений означает ваше согласие с обновленной политикой.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D6D6E] dark:text-[#4FD1C5] flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white m-0">
                10. Контактная информация
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Если у вас есть вопросы о нашей Политике конфиденциальности или вы хотите воспользоваться своими правами, пожалуйста, свяжитесь с нами:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li><strong>Email:</strong> privacy@familypay.com</li>
              <li><strong>Адрес:</strong> [Адрес компании]</li>
              <li><strong>Телефон:</strong> [Телефон поддержки]</li>
            </ul>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] rounded-xl sm:rounded-2xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Ваша конфиденциальность — наш приоритет
          </h3>
          <p className="text-sm sm:text-base text-white/90 mb-3 sm:mb-4">
            Мы постоянно работаем над улучшением защиты ваших данных
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
