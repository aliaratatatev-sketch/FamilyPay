'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserRole {
  role: 'ADMIN' | 'PARENT' | 'TEEN' | 'VIEWER';
}

export default function AIAssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('VIEWER');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Автоскролл при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Фокус на input после отправки
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Получение роли пользователя
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          // Получаем роль из первого семейства пользователя
          if (data.familyMembers && data.familyMembers.length > 0) {
            setUserRole(data.familyMembers[0].role);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    if (status === 'authenticated') {
      fetchUserRole();
    }
  }, [status]);

  // Приветственное сообщение в зависимости от роли
  useEffect(() => {
    if (messages.length === 0 && userRole && userRole !== 'VIEWER') {
      const welcomeMessage = getWelcomeMessage(userRole);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const getWelcomeMessage = (role: string): string => {
    if (role === 'TEEN' || role === 'VIEWER') {
      return '👋 Привет! Я твой финансовый помощник! Расскажу тебе простым языком, как копить деньги на мечту, помогу разобраться с карманными расходами и научу тратить с умом. Спрашивай всё, что интересно! 🎯';
    } else {
      return '👋 Здравствуйте! Я ваш AI финансовый ассистент. Помогу проанализировать расходы семьи, дам рекомендации по оптимизации бюджета и помогу с планированием финансовых целей. Чем могу помочь? 📊';
    }
  };

  const quickPrompts = userRole === 'TEEN' || userRole === 'VIEWER' 
    ? [
        { icon: '💰', text: 'Как мне копить на новый телефон?' },
        { icon: '🎮', text: 'Подскажи, как тратить карманные деньги?' },
        { icon: '🎯', text: 'Помоги составить план накоплений' }
      ]
    : [
        { icon: '📊', text: 'Проанализируй расходы за этот месяц' },
        { icon: '💡', text: 'Как сэкономить на категориях?' },
        { icon: '🎯', text: 'Помоги спланировать цель для накоплений' }
      ];

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    
    if (!textToSend || isLoading) return;

    // Добавляем сообщение пользователя
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Получаем AI ответ (симуляция)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = await getAIResponse(textToSend, userRole);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (message: string, role: string): Promise<string> => {
    try {
      // Вызов API с интеграцией Ollama
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userRole: role,
          conversationHistory: messages.slice(-6) // Последние 6 сообщений для контекста
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      if (data.warning) {
        console.warn('⚠️', data.warning);
      }
      
      return data.reply || 'Извините, не смог сформировать ответ.';
      
    } catch (error) {
      console.error('Error calling AI API:', error);
      // Fallback к базовым ответам при ошибке API
      return getFallbackResponse(message, role);
    }
  };

  // Fallback ответы при недоступности API
  const getFallbackResponse = (message: string, role: string): string => {
    const lowerMessage = message.toLowerCase();
    const isChild = role === 'TEEN' || role === 'VIEWER';
    
    if (isChild) {
      if (lowerMessage.includes('копить') || lowerMessage.includes('накопить')) {
        return '🎯 Отличная идея копить! Вот простой план:\n\n1. **Определи цель** - на что ты копишь и сколько нужно денег\n2. **Узнай срок** - когда тебе нужна эта сумма\n3. **Посчитай** - раздели нужную сумму на количество недель\n4. **Откладывай регулярно** - каждую неделю откладывай эту сумму\n\nНапример, если нужно 10,000₽ за 20 недель, откладывай по 500₽ в неделю! 💪';
      }
      
      if (lowerMessage.includes('игр') || lowerMessage.includes('донат')) {
        return '🎮 Понимаю, хочется! Вот что повысит шансы:\n\n✅ Покажи, что ты уже откладываешь\n✅ Предложи накопить половину сам\n✅ Объясни, почему это важно\n\n💡 Реальность: родители скорее одобрят частичную помощь!';
      }
      
      return '🤔 Я могу помочь тебе с финансами! Спроси что-то конкретное! 😊';
    }
    
    // Для родителей
    if (lowerMessage.includes('расход') || lowerMessage.includes('анализ')) {
      return '📊 **Анализ расходов:**\n\nПроверьте категории:\n• Продукты: 30-35%\n• Жильё: 25-30%\n• Транспорт: 10-15%\n\n💡 Рекомендую детальный анализ в разделе Аналитика!';
    }
    
    return '🤖 Готов помочь с анализом бюджета и планированием! Задайте вопрос. 📊';
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Функция для форматирования текста сообщений
  const formatMessage = (text: string) => {
    // Разбиваем текст на части для обработки форматирования
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Обработка жирного текста **текст**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={index}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 text-xl">Загрузка...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-3 shadow-lg">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ИИ Финансовый Ассистент
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {userRole === 'TEEN' || userRole === 'VIEWER' 
              ? 'Твой личный помощник, который научит копить и разумно тратить! 🎯'
              : 'Персональный помощник для анализа расходов и оптимизации семейного бюджета'}
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🤖</span>
                      <span className="text-xs font-semibold opacity-70">AI Ассистент</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {formatMessage(message.content)}
                  </div>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🤖</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">AI Ассистент</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={userRole === 'TEEN' || userRole === 'VIEWER' ? 'Спроси меня о деньгах...' : 'Задайте вопрос ассистенту...'}
                disabled={isLoading}
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <span className="hidden sm:inline">Отправить</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              💡 Нажмите Enter для отправки, Shift+Enter для новой строки
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {userRole === 'TEEN' || userRole === 'VIEWER' ? 'Что я умею?' : 'Возможности AI-ассистента'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {userRole === 'TEEN' || userRole === 'VIEWER' 
                  ? 'Помогаю понять, как копить деньги, объясняю простым языком про траты и помогаю достичь твоей цели! 🎯'
                  : 'Анализирую транзакции, даю рекомендации по оптимизации бюджета, помогаю с планированием финансовых целей и нахожу возможности для экономии.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
