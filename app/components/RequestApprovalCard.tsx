'use client';

export default function RequestApprovalCard() {
  return (
    <div className="relative w-full max-w-md mx-auto animate-fade-in">
      {/* Фоновое свечение */}
      <div className="absolute -inset-4 bg-gradient-to-br from-[#0D6D6E]/20 to-[#4FD1C5]/20 rounded-3xl blur-2xl animate-pulse-slow" />
      
      {/* Карточка запроса */}
      <div className="relative bg-white dark:bg-[#0f1923] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-teal-500/20 border border-gray-100 dark:border-white/10 transition-all duration-300 hover:shadow-teal-500/30 hover:scale-[1.02]">
        
        {/* Основной контент карточки */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Шапка запроса */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Аватар-инициал */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg">
                <span className="text-white text-lg sm:text-xl font-bold">С</span>
              </div>
              {/* Имя отправителя */}
              <span className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">Сын</span>
            </div>
            {/* Статус */}
            <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-700/50">
              Ожидает решения
            </span>
          </div>

          {/* Сумма и категория */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
                500 сом
              </h3>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Развлечения</span>
            </div>
          </div>

          {/* Комментарий */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              На кино с друзьями
            </p>
          </div>

          {/* Разделитель */}
          <div className="border-t border-gray-100 dark:border-white/5" />

          {/* Информация о бюджете */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Свободно в этом месяце:</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">42 000 сом</span>
          </div>

          {/* Кнопки решения */}
          <div className="space-y-3 pt-2">
            {/* Одобрить */}
            <button className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
              Одобрить
            </button>
            
            {/* Отложить */}
            <button className="w-full py-3 sm:py-3.5 border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 active:scale-95">
              Отложить
            </button>
            
            {/* Отклонить */}
            <button className="w-full py-2.5 text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300 hover:underline">
              Отклонить
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
