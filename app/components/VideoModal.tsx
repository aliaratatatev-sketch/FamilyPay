'use client';

import { useEffect, useRef } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Автовоспроизведение при открытии
      if (videoRef.current) {
        videoRef.current.play();
      }
    } else {
      document.body.style.overflow = 'unset';
      // Остановка при закрытии
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Закрытие по ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Модальное окно */}
      <div 
        className="relative w-full max-w-5xl mx-4 sm:mx-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:rotate-90 z-10"
          aria-label="Закрыть видео"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Видео контейнер */}
        <div className="relative bg-[#0a1628] rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative" style={{ maxHeight: '80vh' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              playsInline
              style={{ maxHeight: '80vh' }}
            >
              <source src={videoUrl} type="video/mp4" />
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>

          {/* Брендинг (опционально, появляется при паузе) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-white font-bold text-sm">FamilyPay</span>
          </div>
        </div>

        {/* Дополнительная информация под видео */}
        <div className="mt-4 text-center">
          <p className="text-white/80 text-sm">
            Нажмите ESC или кликните вне видео для закрытия
          </p>
        </div>
      </div>
    </div>
  );
}
