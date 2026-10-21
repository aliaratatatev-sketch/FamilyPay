'use client';

import { useEffect, useState } from 'react';

export default function AudioUnlockPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Проверяем, был ли уже разблокирован звук
    const unlocked = localStorage.getItem('audioUnlocked');
    if (unlocked) {
      setIsUnlocked(true);
      return;
    }

    // Показываем подсказку через 2 секунды после загрузки
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleUnlock = async () => {
    // Создаем AudioContext и пытаемся его разблокировать
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Воспроизводим тихий тестовый звук
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.01; // Очень тихо
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      // Сохраняем статус разблокировки
      localStorage.setItem('audioUnlocked', 'true');
      localStorage.setItem('audioContextUnlocked', 'true');
      setIsUnlocked(true);
      setShowPrompt(false);
      
      console.log('✅ Audio unlocked successfully!');
    } catch (error) {
      console.warn('⚠️ Failed to unlock audio:', error);
    }
  };

  if (isUnlocked || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9998] animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl p-4 max-w-sm border-2 border-white/20">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">🔊</div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">
              Включить звуковые уведомления?
            </h4>
            <p className="text-xs text-white/90 mb-3">
              Нажмите кнопку, чтобы получать звуковые оповещения о срочных запросах
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUnlock}
                className="flex-1 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-white/90 transition text-sm"
              >
                Включить
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-3 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition text-sm"
              >
                Позже
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
