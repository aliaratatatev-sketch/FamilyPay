/**
 * Пример адаптивной карточки (ResponsiveCard)
 * Демонстрирует best practices для mobile-first дизайна
 */

interface ResponsiveCardProps {
  title: string;
  description: string;
  amount?: number;
  category?: string;
  date?: Date;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ResponsiveCard({
  title,
  description,
  amount,
  category,
  date,
  onEdit,
  onDelete,
}: ResponsiveCardProps) {
  return (
    <div className="
      /* Mobile: Полная ширина, padding 4 */
      w-full p-4 
      
      /* Tablet: Увеличенные отступы */
      md:p-6
      
      /* Desktop: Еще больше пространства */
      lg:p-8
      
      /* Общие стили */
      bg-white dark:bg-gray-800
      rounded-lg
      shadow-sm hover:shadow-md
      transition-shadow
      border border-gray-200 dark:border-gray-700
    ">
      {/* Header - Stack на мобильных, Row на десктопе */}
      <div className="
        flex flex-col gap-2
        md:flex-row md:items-center md:justify-between
        mb-4
      ">
        {/* Title - Адаптивный размер текста */}
        <h3 className="
          text-lg font-semibold
          sm:text-xl
          md:text-2xl
          text-gray-900 dark:text-white
        ">
          {title}
        </h3>

        {/* Amount - Выделяется на мобильных */}
        {amount !== undefined && (
          <div className="
            text-xl font-bold
            sm:text-2xl
            md:text-3xl
            text-teal-600 dark:text-teal-400
          ">
            ${amount.toFixed(2)}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="
        text-sm leading-relaxed
        sm:text-base
        md:text-lg
        text-gray-600 dark:text-gray-300
        mb-4
      ">
        {description}
      </p>

      {/* Meta info - Grid на десктопе, Stack на мобильных */}
      {(category || date) && (
        <div className="
          flex flex-col gap-2
          sm:flex-row sm:gap-4
          md:gap-6
          text-sm text-gray-500 dark:text-gray-400
          mb-4
        ">
          {category && (
            <div className="flex items-center gap-2">
              <span className="
                inline-block w-3 h-3 rounded-full
                bg-teal-500
              " />
              <span>{category}</span>
            </div>
          )}
          
          {date && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions - Touch-friendly кнопки */}
      {(onEdit || onDelete) && (
        <div className="
          flex flex-col gap-2
          sm:flex-row sm:gap-3
          md:gap-4
          pt-4 border-t border-gray-200 dark:border-gray-700
        ">
          {onEdit && (
            <button
              onClick={onEdit}
              className="
                /* Touch target: минимум 44px высота */
                min-h-[44px]
                px-6 py-3
                
                /* Full width на мобильных, auto на десктопе */
                w-full sm:w-auto
                
                /* Адаптивный текст */
                text-sm sm:text-base
                
                /* Стили */
                bg-teal-600 hover:bg-teal-700
                text-white font-medium
                rounded-lg
                transition-colors
                
                /* Активное состояние для touch */
                active:scale-95
                transform transition-transform
              "
            >
              Редактировать
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="
                min-h-[44px]
                px-6 py-3
                w-full sm:w-auto
                text-sm sm:text-base
                
                /* Desktop: outline, Mobile: легкий фон */
                bg-red-50 sm:bg-transparent
                border border-red-600
                text-red-600 hover:bg-red-600 hover:text-white
                font-medium
                rounded-lg
                transition-colors
                active:scale-95
                transform transition-transform
              "
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ИСПОЛЬЗОВАНИЕ:
 * 
 * <ResponsiveCard
 *   title="Продукты"
 *   description="Покупки в супермаркете"
 *   amount={125.50}
 *   category="Еда"
 *   date={new Date()}
 *   onEdit={() => console.log('Edit')}
 *   onDelete={() => console.log('Delete')}
 * />
 */
