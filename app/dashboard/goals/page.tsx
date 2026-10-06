"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  DollarSign,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  categoryId: string | null;
  category?: {
    name: string;
    color: string;
  };
  family: {
    name: string;
  };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

const PRIORITIES = {
  LOW: { text: "Низкий", color: "text-gray-600 bg-gray-100" },
  MEDIUM: { text: "Средний", color: "text-blue-600 bg-blue-100" },
  HIGH: { text: "Высокий", color: "text-red-600 bg-red-100" },
};

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ACTIVE");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  // Contribute form state
  const [contributeAmount, setContributeAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [createTransaction, setCreateTransaction] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session?.user) {
      fetchGoals();
      fetchCategories();
      fetchAccounts();
    }
  }, [session, status]);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.filter((a: Account) => a.balance > 0));
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const goalData = {
      name,
      description: description || null,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline || null,
      categoryId: categoryId || null,
      priority,
      familyId: session?.user?.familyId || undefined,
    };

    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : "/api/goals";
      const method = editingGoal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });

      if (res.ok) {
        fetchGoals();
        handleCloseModal();
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка при сохранении цели");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Ошибка при сохранении цели");
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту цель?")) return;

    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      if (res.ok) {
        fetchGoals();
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка при удалении цели");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Ошибка при удалении цели");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setDescription(goal.description || "");
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
    setCategoryId(goal.categoryId || "");
    setPriority(goal.priority);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingGoal(null);
    setName("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setCategoryId("");
    setPriority("MEDIUM");
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contributingGoal) return;

    try {
      const res = await fetch(`/api/goals/${contributingGoal.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(contributeAmount),
          accountId: selectedAccountId || null,
          createTransaction,
        }),
      });

      if (res.ok) {
        fetchGoals();
        fetchAccounts();
        handleCloseContributeModal();
        alert("Вклад успешно добавлен!");
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка при добавлении вклада");
      }
    } catch (error) {
      console.error("Error contributing:", error);
      alert("Ошибка при добавлении вклада");
    }
  };

  const handleOpenContributeModal = (goal: Goal) => {
    setContributingGoal(goal);
    setContributeAmount("");
    setSelectedAccountId("");
    setCreateTransaction(true);
    setShowContributeModal(true);
  };

  const handleCloseContributeModal = () => {
    setShowContributeModal(false);
    setContributingGoal(null);
    setContributeAmount("");
    setSelectedAccountId("");
    setCreateTransaction(true);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Filter goals
  const filteredGoals = goals.filter((goal) => {
    if (statusFilter === "ALL") return true;
    return goal.status === statusFilter;
  });

  // Calculate stats
  const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.filter((g) => g.status === "ACTIVE").reduce((sum, g) => sum + g.targetAmount, 0);

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
            <h1 className="text-3xl font-bold text-gray-900">Финансовые цели</h1>
            <p className="text-gray-600 mt-1">Планируйте и достигайте своих целей</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Создать цель
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Активные цели</p>
                <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Завершено</p>
                <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Накоплено</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSaved.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Общая цель</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTarget.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === "ACTIVE"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === "COMPLETED"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Завершённые
          </button>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Все
          </button>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === "COMPLETED" ? "Нет завершённых целей" : "Нет активных целей"}
            </h3>
            <p className="text-gray-600 mb-6">
              Создайте первую цель и начните откладывать деньги
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать цель
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => {
              const percentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isCompleted = goal.status === "COMPLETED";
              const isUrgent = daysRemaining !== null && daysRemaining <= 7 && !isCompleted;

              return (
                <div
                  key={goal.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border transition-all ${
                    isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 hover:shadow-md"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{goal.name}</h3>
                      </div>
                      {goal.description && (
                        <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            PRIORITIES[goal.priority].color
                          }`}
                        >
                          {PRIORITIES[goal.priority].text}
                        </span>
                        {goal.category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${goal.category.color}20`,
                              color: goal.category.color,
                            }}
                          >
                            {goal.category.name}
                          </span>
                        )}
                        {isUrgent && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                            <AlertCircle className="w-3 h-3" />
                            Срочно!
                          </span>
                        )}
                      </div>
                    </div>
                    {!isCompleted && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {goal.currentAmount.toLocaleString("ru-RU")} ₽
                      </span>
                      <span className="text-sm text-gray-600">
                        из {goal.targetAmount.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressColor(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {percentage.toFixed(1)}% достигнуто
                      </span>
                      {!isCompleted && (
                        <span className="text-sm text-gray-600">
                          Осталось: {(goal.targetAmount - goal.currentAmount).toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    {goal.deadline ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {daysRemaining !== null && daysRemaining > 0
                            ? `${daysRemaining} дн. осталось`
                            : daysRemaining === 0
                            ? "Сегодня"
                            : "Просрочено"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Без срока</span>
                      </div>
                    )}
                    {!isCompleted && (
                      <button
                        onClick={() => handleOpenContributeModal(goal)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Внести
                      </button>
                    )}
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                        <Award className="w-4 h-4" />
                        Цель достигнута!
                      </div>
                    )}
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
                {editingGoal ? "Редактировать цель" : "Создать цель"}
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
                    placeholder="Например: Отпуск"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Краткое описание цели"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевая сумма (₽) *
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текущая сумма (₽)
                  </label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок достижения
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Приоритет *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LOW">Низкий</option>
                    <option value="MEDIUM">Средний</option>
                    <option value="HIGH">Высокий</option>
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
                    <option value="">Без категории</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                    {editingGoal ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contribute Modal */}
        {showContributeModal && contributingGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Внести вклад в цель
              </h2>
              <p className="text-gray-600 mb-6">{contributingGoal.name}</p>

              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сумма вклада (₽) *
                  </label>
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Осталось собрать: {(contributingGoal.targetAmount - contributingGoal.currentAmount).toLocaleString("ru-RU")} ₽
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={createTransaction}
                      onChange={(e) => setCreateTransaction(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Списать со счёта</span>
                  </label>

                  {createTransaction && (
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={createTransaction}
                    >
                      <option value="">Выберите счёт</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.balance.toLocaleString("ru-RU")} {acc.currency})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseContributeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Внести
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
