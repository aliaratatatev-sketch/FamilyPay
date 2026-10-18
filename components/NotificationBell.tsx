"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, DollarSign, CheckCircle, XCircle, AlertTriangle, Target, TrendingUp, Trophy, Star, Users, CreditCard, Zap, Info } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      MONEY_REQUEST: DollarSign,
      REQUEST_APPROVED: CheckCircle,
      REQUEST_REJECTED: XCircle,
      BUDGET_ALERT: AlertTriangle,
      GOAL_CREATED: Target,
      GOAL_UPDATED: TrendingUp,
      GOAL_COMPLETED: Trophy,
      GOAL_MILESTONE: Star,
      FAMILY_INVITE: Users,
      LOW_BALANCE: CreditCard,
      LARGE_EXPENSE: Zap,
      SYSTEM: Info,
    };
    return iconMap[type] || Bell;
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "MONEY_REQUEST":
        // Переход на страницу управления запросами для родителей
        return notification.relatedId 
          ? `/dashboard/manage-requests?requestId=${notification.relatedId}`
          : "/dashboard/manage-requests";
      case "REQUEST_APPROVED":
      case "REQUEST_REJECTED":
        // Переход на страницу своих запросов для детей
        return notification.relatedId 
          ? `/dashboard/money-requests?requestId=${notification.relatedId}`
          : "/dashboard/money-requests";
      case "BUDGET_ALERT":
        return "/dashboard/budgets";
      case "GOAL_CREATED":
      case "GOAL_UPDATED":
      case "GOAL_COMPLETED":
      case "GOAL_MILESTONE":
        return notification.relatedId 
          ? `/dashboard/goals?id=${notification.relatedId}`
          : "/dashboard/goals";
      case "FAMILY_INVITE":
        return "/dashboard/family";
      case "LOW_BALANCE":
      case "LARGE_EXPENSE":
        return "/dashboard/accounts";
      default:
        return "/dashboard/notifications";
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Только что";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч. назад`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} дн. назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed inset-x-4 top-16 w-auto sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:inset-x-auto sm:mt-2 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Уведомления</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Прочитать все
                </button>
              )}
              <Link
                href="/dashboard/notifications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Все уведомления
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Нет уведомлений</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {(() => {
                        const IconComponent = getNotificationIcon(notification.type);
                        return <IconComponent className="w-5 h-5 text-blue-600" />;
                      })()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm break-words">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(notification.createdAt)}
                        </span>
                        <button
                          onClick={(e) => deleteNotification(notification.id, e)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Посмотреть все уведомления →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
