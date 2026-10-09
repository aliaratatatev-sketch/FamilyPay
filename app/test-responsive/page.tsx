/**
 * Тестовая страница для проверки адаптивности
 * URL: /test-responsive
 */

import ResponsiveCard from '@/components/examples/ResponsiveCard';
import ResponsiveForm from '@/components/examples/ResponsiveForm';

export default function TestResponsivePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Header */}
      <div className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-8 md:mb-12
      ">
        <h1 className="
          text-3xl sm:text-4xl md:text-5xl
          font-bold text-gray-900 dark:text-white
          mb-4
        ">
          🧪 Тест адаптивности
        </h1>
        <p className="
          text-sm sm:text-base md:text-lg
          text-gray-600 dark:text-gray-400
          max-w-3xl
        ">
          Эта страница демонстрирует адаптивный дизайн. Откройте на разных устройствах или измените размер окна браузера.
        </p>

        {/* Screen Size Indicator */}
        <div className="
          mt-4 p-4 bg-white dark:bg-gray-800
          rounded-lg border border-gray-200 dark:border-gray-700
        ">
          <p className="text-sm font-mono">
            Текущий breakpoint: 
            <span className="inline sm:hidden text-teal-600 font-bold"> Mobile (&lt;640px)</span>
            <span className="hidden sm:inline md:hidden text-blue-600 font-bold"> Tablet (640px-767px)</span>
            <span className="hidden md:inline lg:hidden text-purple-600 font-bold"> Tablet Large (768px-1023px)</span>
            <span className="hidden lg:inline xl:hidden text-orange-600 font-bold"> Desktop (1024px-1279px)</span>
            <span className="hidden xl:inline text-red-600 font-bold"> Desktop Large (≥1280px)</span>
          </p>
        </div>
      </div>

      {/* Responsive Grid Section */}
      <section className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-12 md:mb-16
      ">
        <h2 className="
          text-2xl sm:text-3xl md:text-4xl
          font-bold mb-6 md:mb-8
          text-gray-900 dark:text-white
        ">
          📦 Адаптивная сетка
        </h2>

        <div className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-4 md:gap-6
        ">
          <ResponsiveCard
            title="Продукты"
            description="Покупки в супермаркете Пятерочка"
            amount={125.50}
            category="Еда"
            date={new Date()}
            onEdit={() => alert('Edit clicked')}
            onDelete={() => alert('Delete clicked')}
          />
          
          <ResponsiveCard
            title="Бензин"
            description="Заправка на трассе М11"
            amount={85.00}
            category="Транспорт"
            date={new Date()}
            onEdit={() => alert('Edit clicked')}
            onDelete={() => alert('Delete clicked')}
          />
          
          <ResponsiveCard
            title="Кино"
            description="Билеты в кинотеатр на новый фильм"
            amount={45.00}
            category="Развлечения"
            date={new Date()}
            onEdit={() => alert('Edit clicked')}
            onDelete={() => alert('Delete clicked')}
          />
        </div>
      </section>

      {/* Responsive Form Section */}
      <section className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-12 md:mb-16
      ">
        <h2 className="
          text-2xl sm:text-3xl md:text-4xl
          font-bold mb-6 md:mb-8
          text-gray-900 dark:text-white
        ">
          📝 Адаптивная форма
        </h2>

        <ResponsiveForm />
      </section>

      {/* Typography Test */}
      <section className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-12 md:mb-16
      ">
        <h2 className="
          text-2xl sm:text-3xl md:text-4xl
          font-bold mb-6 md:mb-8
          text-gray-900 dark:text-white
        ">
          📝 Типографика
        </h2>

        <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Heading 1 - Responsive
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Heading 2 - Responsive
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
            Heading 3 - Responsive
          </h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Параграф с адаптивным размером. На мобильных это будет text-sm (14px), 
            на планшетах text-base (16px), на десктопах text-lg (18px). 
            Line-height остается комфортным на всех размерах.
          </p>
        </div>
      </section>

      {/* Button Test */}
      <section className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-12 md:mb-16
      ">
        <h2 className="
          text-2xl sm:text-3xl md:text-4xl
          font-bold mb-6 md:mb-8
          text-gray-900 dark:text-white
        ">
          🔘 Кнопки (Touch-friendly)
        </h2>

        <div className="
          flex flex-col sm:flex-row
          gap-3 md:gap-4
        ">
          <button className="
            min-h-[44px] px-6 py-3
            w-full sm:w-auto
            bg-teal-600 hover:bg-teal-700
            text-white font-medium rounded-lg
            active:scale-95 transform transition-all
          ">
            Primary Button
          </button>
          
          <button className="
            min-h-[44px] px-6 py-3
            w-full sm:w-auto
            border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-300
            font-medium rounded-lg
            hover:bg-gray-50 dark:hover:bg-gray-700
            active:scale-95 transform transition-all
          ">
            Secondary Button
          </button>
          
          <button className="
            min-h-[44px] px-6 py-3
            w-full sm:w-auto
            bg-red-600 hover:bg-red-700
            text-white font-medium rounded-lg
            active:scale-95 transform transition-all
          ">
            Danger Button
          </button>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-gray-500">
          ✓ Минимум 44x44px (Touch-friendly)<br/>
          ✓ Full-width на мобильных, auto на десктопе<br/>
          ✓ Active scale для tactile feedback
        </p>
      </section>

      {/* Spacing Test */}
      <section className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-12 md:mb-16
      ">
        <h2 className="
          text-2xl sm:text-3xl md:text-4xl
          font-bold mb-6 md:mb-8
          text-gray-900 dark:text-white
        ">
          📏 Адаптивные отступы
        </h2>

        <div className="
          p-4 md:p-6 lg:p-8
          bg-teal-50 dark:bg-teal-900/20
          rounded-lg border-2 border-teal-500
        ">
          <p className="text-sm sm:text-base">
            Этот блок имеет адаптивный padding:
            <br/>
            Mobile: p-4 (16px)
            <br/>
            Tablet: p-6 (24px)
            <br/>
            Desktop: p-8 (32px)
          </p>
        </div>
      </section>

      {/* Instructions */}
      <section className="
        container mx-auto px-4 sm:px-6 lg:px-8
        mb-12
      ">
        <div className="
          bg-blue-50 dark:bg-blue-900/20
          border border-blue-200 dark:border-blue-800
          rounded-lg p-6
        ">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            💡 Как тестировать
          </h3>
          <ul className="space-y-2 text-sm sm:text-base text-blue-800 dark:text-blue-200">
            <li>✅ Измените размер окна браузера</li>
            <li>✅ Откройте Chrome DevTools (F12) → Device Toolbar</li>
            <li>✅ Отсканируйте QR-код при запуске <code>npm run dev</code></li>
            <li>✅ Проверьте на реальном телефоне</li>
            <li>✅ Протестируйте в portrait и landscape</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
