"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  Search,
  CheckCheck,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  createdAt: string;
}

const NOTIFICATION_TYPES = {
  MONEY_REQUEST: { icon: "💰", label: "Запрос на деньги", color: "bg-blue-100 text-blue-600" },
  REQUEST_APPROVED: { icon: "✅", label: "Запрос одобрен", color: "bg-green-100 text-green-600" },
  REQUEST_REJECTED: { icon: "❌", label: "Запрос отклонён", color: "bg-red-100 text-red-600" },
  BUDGET_ALERT: { icon: "⚠️", label: "Превышение бюджета", color: "bg-orange-100 text-orange-600" },
  GOAL_CREATED: { icon: "🎯", label: "Новая цель", color: "bg-purple-100 text-purple-600" },
  GOAL_UPDATED: { icon: "📈", label: "Цель обновлена", color: "bg-blue-100 text-blue-600" },
  GOAL_COMPLETED: { icon: "🎉", label: "Цель достигнута", color: "bg-green-100 text-green-600" },
  GOAL_MILESTONE: { icon: "⭐", label: "Прогресс по цели", color: "bg-yellow-100 text-yellow-600" },
  FAMILY_INVITE: { icon: "👨‍👩‍👧‍👦", label: "Приглашение в семью", color: "bg-pink-100 text-pink-600" },
  LOW_BALANCE: { icon: "💳", label: "Низкий баланс", color: "bg-red-100 text-red-600" },
  LARGE_EXPENSE: { icon: "💸", label: "Большая трата", color: "bg-orange-100 text-orange-600" },
  SYSTEM: { icon: "ℹ️", label: "Системное", color: "bg-gray-100 text-gray-600" },
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session?.user) {
      fetchNotifications();
    }
  }, [session, status]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      if (res.ok) {
        fetchNotifications();
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
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

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!confirm(`Удалить выбранные уведомления (${notificationIds.length})?`)) return;

    try {
      await Promise.all(
        notificationIds.map((id) =>
          fetch(`/api/notifications?id=${id}`, { method: "DELETE" })
        )
      );
      fetchNotifications();
      setSelectedIds([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const deleteAllRead = async () => {
    if (!confirm("Удалить все прочитанные уведомления?")) return;

    try {
      const res = await fetch("/api/notifications?deleteAll=true", {
        method: "DELETE",
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting all read notifications:", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
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
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(query) &&
        !notification.message.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Read/Unread filter
    if (filterRead === "UNREAD" && notification.isRead) return false;
    if (filterRead === "READ" && !notification.isRead) return false;

    // Type filter
    if (filterType !== "ALL" && notification.type !== filterType) return false;

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0
              ? `У вас ${unreadCount} непрочитанных уведомлений`
              : "Все уведомления прочитаны"}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    Выбрано: {selectedIds.length}
                  </span>
                  <button
                    onClick={() => markAsRead(selectedIds)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Прочитать
                  </button>
                  <button
                    onClick={() => deleteNotifications(selectedIds)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Прочитать все
                </button>
              )}
              <button
                onClick={deleteAllRead}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Очистить прочитанные
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск уведомлений..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Read Filter */}
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Все</option>
              <option value="UNREAD">Непрочитанные</option>
              <option value="READ">Прочитанные</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Все типы</option>
              {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Нет уведомлений
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterType !== "ALL" || filterRead !== "ALL"
                ? "Попробуйте изменить фильтры"
                : "Новые уведомления появятся здесь"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All */}
            <div className="bg-white rounded-lg shadow-sm px-4 py-2 border border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Выбрать все ({filteredNotifications.length})
                </span>
              </label>
            </div>

            {/* Notifications */}
            {filteredNotifications.map((notification) => {
              const typeInfo = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.SYSTEM;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm p-4 border transition-all ${
                    !notification.isRead
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-100"
                  } ${
                    selectedIds.includes(notification.id)
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={() => toggleSelect(notification.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className="text-3xl flex-shrink-0">{typeInfo.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {getRelativeTime(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Прочитано
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotifications([notification.id])}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
