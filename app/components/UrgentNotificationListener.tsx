'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export default function UrgentNotificationListener() {
  const { data: session, status } = useSession();
  const [urgentNotification, setUrgentNotification] = useState<AppNotification | null>(null);
  const lastCheckRef = useRef<Date>(new Date());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Инициализация аудио элемента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAudioReady(true);
      
      // Создаем обработчик для разблокировки звука при первом клике
      const unlockAudio = () => {
        console.log('🔓 Unlocking audio context...');
        
        // Создаем AudioContext при первом взаимодействии
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('✅ AudioContext resumed successfully!');
            localStorage.setItem('audioContextUnlocked', 'true');
          });
        }
        
        // Удаляем обработчики после первого срабатывания
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
      
      // Проверяем, был ли уже разблокирован
      const wasUnlocked = localStorage.getItem('audioContextUnlocked');
      if (!wasUnlocked) {
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
      }
      
      return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Запрос разрешения на browser notifications
  useEffect(() => {
    if (status === 'authenticated' && typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Функция проверки новых срочных уведомлений
    const checkForUrgentNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?unreadOnly=true');
        if (!response.ok) return;

        const data = await response.json();
        const notifications: AppNotification[] = data.notifications || [];

        // Ищем срочные уведомления, которые пришли после последней проверки
        const urgentNotifs = notifications.filter(
          (n) =>
            n.type === 'URGENT_REQUEST' &&
            !n.read &&
            new Date(n.createdAt) > lastCheckRef.current
        );

        if (urgentNotifs.length > 0) {
          const latestUrgent = urgentNotifs[0];
          
          console.log('🚨 New urgent notification received');
          
          // Вибрация для мобильных устройств (работает автоматически!)
          if ('vibrate' in navigator) {
            // Паттерн вибрации: вибрация-пауза-вибрация
            navigator.vibrate([200, 100, 200, 100, 200, 300, 200, 100, 200]);
          }
          
          // НЕ воспроизводим звук автоматически - ждем клика пользователя
          
          // Показываем browser notification
          if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
            const browserNotification = new window.Notification('🚨 Срочный запрос на деньги!', {
              body: latestUrgent.message,
              icon: '/favicon.ico',
              tag: 'urgent-request',
              requireInteraction: true,
            });
            
            browserNotification.onclick = () => {
              window.focus();
              stopRingtone();
              if (latestUrgent?.data?.moneyRequestId) {
                window.location.href = `/dashboard/manage-requests/${latestUrgent.data.moneyRequestId}`;
              }
              browserNotification.close();
            };
          }
          
          // Показываем наше уведомление
          setUrgentNotification(latestUrgent);
          
          // Скрываем через 30 секунд и останавливаем звук
          setTimeout(() => {
            setUrgentNotification(null);
            stopRingtone();
          }, 30000);
        }

        lastCheckRef.current = new Date();
      } catch (error) {
        console.error('Error checking urgent notifications:', error);
      }
    };

    // Проверяем сразу при монтировании
    checkForUrgentNotifications();

    // Затем проверяем каждые 10 секунд
    checkIntervalRef.current = setInterval(checkForUrgentNotifications, 10000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      stopRingtone();
    };
  }, [status]);

  const playRingtone = async () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        console.warn('AudioContext not supported');
        return;
      }
      
      const ctx = new AudioCtx();
      
      // Обязательная разблокировка AudioContext
      if (ctx.state === 'suspended') {
        await ctx.resume();
        console.log('✅ AudioContext resumed');
      }
      
      // Создаем осциллятор для звука
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Настройки звука - классический телефонный звонок
      oscillator.frequency.value = 800; // 800Hz - частота телефонного звонка
      oscillator.type = 'sine';
      
      // Паттерн звонка: звук-пауза-звук
      const now = ctx.currentTime;
      
      // Первый звонок
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
      
      // Второй звонок
      gainNode.gain.setValueAtTime(0, now + 0.5);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.6);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.9);
      
      oscillator.start(now);
      oscillator.stop(now + 1);
      
      console.log('🔊 Playing ringtone via Web Audio API');
      
      // Также пытаемся озвучить текстом через Speech Synthesis API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Срочный запрос на деньги');
        utterance.lang = 'ru-RU';
        utterance.rate = 1.5;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Failed to play ringtone:', error);
    }
  };

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleViewRequest = () => {
    stopRingtone();
    if (urgentNotification?.data?.moneyRequestId) {
      window.location.href = `/dashboard/manage-requests/${urgentNotification.data.moneyRequestId}`;
    }
    setUrgentNotification(null);
  };

  const handleDismiss = () => {
    stopRingtone();
    setUrgentNotification(null);
  };

  if (!urgentNotification) return null;

  return (
    <>
      {/* Скрытый audio элемент для рингтона с реальным звуком телефонного звонка */}
      <audio
        ref={(ref) => {
          if (ref && !audioRef.current) {
            audioRef.current = ref;
            // Используем стандартный системный звук через data URI
            // Это обходит некоторые ограничения браузера
            ref.src = 'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwBK8AAAAAAAAAABUgJAYLQQAB9AAAYYbpU2vAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxAYDwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
            ref.volume = 0.7;
          }
        }}
        loop
        preload="auto"
        playsInline
        muted={false}
      />
      
      <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-[9999] animate-fade-in">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-white/20 animate-[wiggle_1s_ease-in-out_infinite]">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="text-4xl animate-bounce flex-shrink-0">
              🚨
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 break-words">
                {urgentNotification.title}
              </h3>
              <p className="text-sm text-white/90 break-words">
                {urgentNotification.message}
              </p>
              <p className="text-xs text-white/70 mt-2 animate-pulse">
                🔊 Звонок воспроизводится автоматически...
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white text-2xl leading-none flex-shrink-0"
              title="Закрыть и остановить звонок"
            >
              ×
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* Кнопка воспроизведения звука */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playRingtone();
              }}
              className="w-full py-3 bg-yellow-400 text-yellow-900 font-bold rounded-lg hover:bg-yellow-300 transition text-base shadow-lg flex items-center justify-center gap-2"
            >
              🔊 Прослушать звонок
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleViewRequest}
                className="flex-1 py-2.5 bg-white text-red-600 font-semibold rounded-lg hover:bg-white/90 transition"
              >
                📋 Рассмотреть запрос
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition"
              >
                Позже
              </button>
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-pulse pointer-events-none" />
        </div>
      </div>
    </>
  );
}
