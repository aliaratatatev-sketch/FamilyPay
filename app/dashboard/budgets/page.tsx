"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Plus,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  alertAt50: boolean;
  alertAt80: boolean;
  alertAt100: boolean;
  startDate: string;
  endDate: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

const PERIODS = {
  DAILY: "День",
  WEEKLY: "Неделя",
  MONTHLY: "Месяц",
  YEARLY: "Год",
};

export default function BudgetsPage() {
  const { data: session, status } = useSession();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [categoryId, setCategoryId] = useState("");
  const [alertAt50, setAlertAt50] = useState(true);
  const [alertAt80, setAlertAt80] = useState(true);
  const [alertAt100, setAlertAt100] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session?.user) {
      fetchBudgets();
      fetchCategories();
    }
  }, [session, status]);

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets");
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter((c: Category) => c.type === "EXPENSE"));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const budgetData = {
      name,
      amount: parseFloat(amount),
      period,
      categoryId: categoryId || null,
      alertAt50,
      alertAt80,
      alertAt100,
    };

    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : "/api/budgets";
      const method = editingBudget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      });

      if (res.ok) {
        fetchBudgets();
        handleCloseModal();
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка при сохранении бюджета");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Ошибка при сохранении бюджета");
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот бюджет?")) return;

    try {
      const res = await fetch(`/api/budgets/${budgetId}`, { method: "DELETE" });
      if (res.ok) {
        fetchBudgets();
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка при удалении бюджета");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Ошибка при удалении бюджета");
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setName(budget.name);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setCategoryId(budget.categoryId || "");
    setAlertAt50(budget.alertAt50);
    setAlertAt80(budget.alertAt80);
    setAlertAt100(budget.alertAt100);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingBudget(null);
    setName("");
    setAmount("");
    setPeriod("MONTHLY");
    setCategoryId("");
    setAlertAt50(true);
    setAlertAt80(true);
    setAlertAt100(true);
  };

  const getProgressPercentage = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getAlertLevel = (spent: number, total: number) => {
    const percentage = (spent / total) * 100;
    if (percentage >= 100) return { level: "critical", text: "Превышен лимит!", color: "text-red-600 bg-red-50" };
    if (percentage >= 80) return { level: "warning", text: "Осталось 20%", color: "text-orange-600 bg-orange-50" };
    if (percentage >= 50) return { level: "caution", text: "Осталось 50%", color: "text-yellow-600 bg-yellow-50" };
    return null;
  };

  // Calculate stats
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetsWithAlerts = budgets.filter((b) => {
    const percentage = (b.spent / b.amount) * 100;
    return percentage >= 50;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Бюджеты</h1>
            <p className="text-gray-600 mt-1">Управляйте бюджетами семьи</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Создать бюджет
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Общий бюджет</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBudget.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Потрачено</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSpent.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Требуют внимания</p>
                <p className="text-2xl font-bold text-gray-900">{budgetsWithAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет бюджетов</h3>
            <p className="text-gray-600 mb-6">Создайте первый бюджет для отслеживания расходов</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать бюджет
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = getProgressPercentage(budget.spent, budget.amount);
              const alert = getAlertLevel(budget.spent, budget.amount);

              return (
                <div
                  key={budget.id}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{budget.name}</h3>
                        {budget.category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${budget.category.color}20`,
                              color: budget.category.color,
                            }}
                          >
                            {budget.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{PERIODS[budget.period]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Alert */}
                  {alert && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${alert.color}`}>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{alert.text}</span>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {budget.spent.toLocaleString("ru-RU")} ₽
                      </span>
                      <span className="text-sm text-gray-600">
                        из {budget.amount.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressColor(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-gray-700">{percentage.toFixed(1)}%</span>
                      <span className="text-sm text-gray-600">
                        Осталось: {(budget.amount - budget.spent).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>

                  {/* Period info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <span>
                      С {new Date(budget.startDate).toLocaleDateString("ru-RU")}
                    </span>
                    <span>
                      До {new Date(budget.endDate).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingBudget ? "Редактировать бюджет" : "Создать бюджет"}
              </h2>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Например: Продукты"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сумма (₽) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Период *
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DAILY">День</option>
                    <option value="WEEKLY">Неделя</option>
                    <option value="MONTHLY">Месяц</option>
                    <option value="YEARLY">Год</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория (опционально)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все категории</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alerts */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Уведомления при достижении:
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertAt50}
                      onChange={(e) => setAlertAt50(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">50% бюджета</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertAt80}
                      onChange={(e) => setAlertAt80(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">80% бюджета</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertAt100}
                      onChange={(e) => setAlertAt100(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">100% бюджета</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingBudget ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
