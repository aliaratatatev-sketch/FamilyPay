/**
 * Пример адаптивной формы (ResponsiveForm)
 * Демонстрирует best practices для форм на мобильных устройствах
 */

'use client';

import { useState } from 'react';

export default function ResponsiveForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    category: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="
      /* Container */
      w-full max-w-4xl mx-auto
      p-4 sm:p-6 lg:p-8
      bg-white dark:bg-gray-800
      rounded-lg shadow-lg
    ">
      {/* Form Title */}
      <h2 className="
        text-xl sm:text-2xl md:text-3xl
        font-bold mb-6 md:mb-8
        text-gray-900 dark:text-white
      ">
        Добавить транзакцию
      </h2>

      {/* Form Fields - Grid layout */}
      <div className="
        /* Mobile: 1 колонка */
        grid grid-cols-1
        
        /* Desktop: 2 колонки */
        md:grid-cols-2
        
        gap-4 md:gap-6
        mb-6
      ">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="
            block text-sm sm:text-base
            font-medium text-gray-700 dark:text-gray-300
          ">
            Название
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Продукты"
            className="
              /* Full width всегда */
              w-full
              
              /* Touch-friendly высота */
              min-h-[44px]
              px-4 py-3
              
              /* Адаптивный размер текста */
              text-sm sm:text-base
              
              /* Стили */
              border border-gray-300 dark:border-gray-600
              rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder-gray-400
              
              /* Focus состояние */
              focus:ring-2 focus:ring-teal-500 focus:border-transparent
              outline-none
              
              /* Transition */
              transition-all
            "
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="
            block text-sm sm:text-base
            font-medium text-gray-700 dark:text-gray-300
          ">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@mail.com"
            className="
              w-full min-h-[44px] px-4 py-3
              text-sm sm:text-base
              border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-teal-500 focus:border-transparent
              outline-none transition-all
            "
          />
        </div>

        {/* Amount Field */}
        <div className="space-y-2">
          <label className="
            block text-sm sm:text-base
            font-medium text-gray-700 dark:text-gray-300
          ">
            Сумма
          </label>
          <div className="relative">
            <span className="
              absolute left-4 top-1/2 -translate-y-1/2
              text-gray-500 text-sm sm:text-base
            ">
              $
            </span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
              className="
                w-full min-h-[44px] pl-8 pr-4 py-3
                text-sm sm:text-base
                border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-teal-500 focus:border-transparent
                outline-none transition-all
              "
            />
          </div>
        </div>

        {/* Category Field */}
        <div className="space-y-2">
          <label className="
            block text-sm sm:text-base
            font-medium text-gray-700 dark:text-gray-300
          ">
            Категория
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="
              w-full min-h-[44px] px-4 py-3
              text-sm sm:text-base
              border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-teal-500 focus:border-transparent
              outline-none transition-all
              
              /* Важно для мобильных select */
              appearance-none
              cursor-pointer
            "
          >
            <option value="">Выберите категорию</option>
            <option value="food">🍕 Еда</option>
            <option value="transport">🚗 Транспорт</option>
            <option value="entertainment">🎬 Развлечения</option>
            <option value="shopping">🛍️ Покупки</option>
            <option value="bills">💡 Счета</option>
          </select>
        </div>
      </div>

      {/* Description - Full width */}
      <div className="space-y-2 mb-6">
        <label className="
          block text-sm sm:text-base
          font-medium text-gray-700 dark:text-gray-300
        ">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Добавьте заметку..."
          rows={4}
          className="
            w-full px-4 py-3
            text-sm sm:text-base
            border border-gray-300 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            placeholder-gray-400
            focus:ring-2 focus:ring-teal-500 focus:border-transparent
            outline-none transition-all
            resize-none
          "
        />
      </div>

      {/* Submit Buttons */}
      <div className="
        /* Mobile: Stack, Desktop: Row */
        flex flex-col sm:flex-row
        gap-3 md:gap-4
        
        /* На десктопе выравнивание справа */
        sm:justify-end
      ">
        <button
          type="button"
          className="
            /* Touch-friendly */
            min-h-[44px]
            px-6 py-3
            
            /* Full width на мобильных */
            w-full sm:w-auto
            
            /* Адаптивный текст */
            text-sm sm:text-base
            font-medium
            
            /* Стили */
            border border-gray-300 dark:border-gray-600
            rounded-lg
            text-gray-700 dark:text-gray-300
            bg-white dark:bg-gray-700
            hover:bg-gray-50 dark:hover:bg-gray-600
            
            /* Active state для touch */
            active:scale-95
            transform transition-all
          "
        >
          Отмена
        </button>

        <button
          type="submit"
          className="
            min-h-[44px]
            px-6 py-3
            w-full sm:w-auto
            text-sm sm:text-base
            font-medium
            
            /* Primary button */
            bg-teal-600 hover:bg-teal-700
            text-white
            rounded-lg
            
            /* Shadow для emphasis */
            shadow-lg hover:shadow-xl
            
            active:scale-95
            transform transition-all
            
            /* Loading/disabled state можно добавить */
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Сохранить
        </button>
      </div>

      {/* Helper Text */}
      <p className="
        mt-4 text-xs sm:text-sm
        text-gray-500 dark:text-gray-400
        text-center sm:text-right
      ">
        Все поля обязательны для заполнения
      </p>
    </form>
  );
}

/**
 * KEY FEATURES:
 * 
 * 1. Touch-friendly inputs (min-h-[44px])
 * 2. Full width на мобильных (w-full)
 * 3. Grid адаптируется (1 col → 2 cols)
 * 4. Кнопки стекаются на мобильных
 * 5. Адаптивные отступы и размеры текста
 * 6. Proper focus states
 * 7. Dark mode support
 * 8. Active states для touch
 * 
 * MOBILE OPTIMIZATIONS:
 * - Большие touch targets
 * - Четкие labels
 * - Placeholder подсказки
 * - Полноширинные кнопки на мобильных
 * - Комфортные отступы
 */
