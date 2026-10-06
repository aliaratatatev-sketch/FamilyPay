'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем уведомления при монтировании компонента
  useEffect(() => {
    if (session?.user) {
      loadNotifications();
      
      // Обновляем уведомления каждые 30 секунд
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FAMILY_INVITE':
        return '👨‍👩‍👧‍👦';
      case 'BUDGET_ALERT':
        return '💰';
      case 'GOAL_MILESTONE':
        return '🎯';
      case 'RECURRING_DUE':
        return '🔔';
      case 'LOW_BALANCE':
        return '⚠️';
      case 'LARGE_EXPENSE':
        return '💸';
      case 'SYSTEM':
        return 'ℹ️';
      default:
        return '📬';
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (!session?.user) return null;

  return (
    <div className="relative">
      {/* Кнопка колокольчика */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-[#0D6D6E] dark:hover:text-[#4FD1C5] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Уведомления"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Индикатор непрочитанных */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Выпадающее меню с уведомлениями */}
      {isOpen && (
        <>
          {/* Backdrop для закрытия меню */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Меню */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Уведомления
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isLoading}
                  className="text-xs text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline disabled:opacity-50"
                >
                  Прочитать все
                </button>
              )}
            </div>

            {/* Список уведомлений */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-sm">Нет уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Иконка */}
                        <div className="text-2xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Содержимое */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            
                            {/* Кнопка удаления */}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                              aria-label="Удалить"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {getTimeSince(notification.createdAt)}
                            </span>
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
                              >
                                Отметить прочитанным
                              </button>
                            )}
                          </div>

                          {/* Кнопка действия для приглашений в семью */}
                          {notification.type === 'FAMILY_INVITE' && notification.data?.familyId && (
                            <Link
                              href={`/dashboard/family`}
                              onClick={() => {
                                markAsRead(notification.id);
                                setIsOpen(false);
                              }}
                              className="inline-block mt-2 text-xs px-3 py-1.5 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-lg hover:shadow-md transition"
                            >
                              Посмотреть семью
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Футер */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-[#0D6D6E] dark:text-[#4FD1C5] hover:underline"
                >
                  Посмотреть все уведомления
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
