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
  ChevronDown,
} from "lucide-react";
import { useDashboardLocale } from "@/app/i18n/useDashboardLocale";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null; // Frontend keeps this name for compatibility
  targetDate?: string | null; // Backend field name
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED";
  priority: "LOW" | "MEDIUM" | "HIGH"; // Frontend only, not saved to DB
  categoryId: string | null; // Frontend only, not saved to DB
  category?: {
    name: string;
    color: string;
  };
  family: {
    name: string;
  };
  createdAt: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Family {
  id: string;
  name: string;
  currency: string;
}

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const { t } = useDashboardLocale();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
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

  // Contribute form state
  const [contributeAmount, setContributeAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [createTransaction, setCreateTransaction] = useState(true);

  // Custom dropdown states
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session?.user) {
      fetchFamilies();
      fetchGoals();
      fetchAccounts();
    }
  }, [session, status]);

  const fetchFamilies = async () => {
    try {
      const response = await fetch('/api/families');
      const data = await response.json();
      if (response.ok) {
        const familyList = Array.isArray(data.families) ? data.families : [];
        setFamilies(familyList);
        // Set first family as default
        if (familyList.length > 0 && !selectedFamilyId) {
          setSelectedFamilyId(familyList[0].id);
        }
      } else {
        console.error('Failed to fetch families:', response.statusText);
        setFamilies([]);
      }
    } catch (error) {
      console.error('Error fetching families:', error);
      setFamilies([]);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch goals:", res.statusText);
        setGoals([]);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        // API returns { accounts: [...] }
        const accountsArray = Array.isArray(data.accounts) ? data.accounts : [];
        setAccounts(accountsArray.filter((a: Account) => a.balance > 0));
      } else {
        console.error("Failed to fetch accounts:", res.statusText);
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use first family if none selected
    const targetFamilyId = selectedFamilyId || (families.length > 0 ? families[0].id : '');

    // Validate required fields
    if (!targetFamilyId) {
      alert("Пожалуйста, создайте семью сначала");
      return;
    }

    if (!name || !targetAmount) {
      alert("Пожалуйста, заполните обязательные поля");
      return;
    }

    if (parseFloat(targetAmount) <= 0) {
      alert("Целевая сумма должна быть больше нуля");
      return;
    }

    const goalData = {
      name,
      description: description || null,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline || null,
      familyId: targetFamilyId,
    };

    console.log('Sending goal data:', goalData); // Debug log

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
        alert("Цель успешно сохранена!");
      } else {
        const error = await res.json();
        console.error('API Error:', error); // Debug log
        const errorMessage = error.details 
          ? `${error.error}: ${error.details}` 
          : error.error || "Ошибка при сохранении цели";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Ошибка при сохранении цели. Проверьте консоль для деталей.");
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
    setTargetAmount(parseFloat(String(goal.targetAmount)).toString());
    setCurrentAmount(parseFloat(String(goal.currentAmount)).toString());
    setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
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
    const currentNum = parseFloat(String(current));
    const targetNum = parseFloat(String(target));
    return Math.min((currentNum / targetNum) * 100, 100);
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
  }).map(goal => ({
    ...goal,
    // Map targetDate to deadline for frontend compatibility
    deadline: goal.targetDate || goal.deadline || null,
    // Set default priority if not present (not saved in DB)
    priority: goal.priority || "MEDIUM" as "LOW" | "MEDIUM" | "HIGH"
  }));

  // Calculate stats
  const activeGoals = Array.isArray(goals) ? goals.filter((g) => g.status === "ACTIVE").length : 0;
  const completedGoals = Array.isArray(goals) ? goals.filter((g) => g.status === "COMPLETED").length : 0;
  const totalSaved = Array.isArray(goals) ? goals.reduce((sum, g) => sum + parseFloat(String(g.currentAmount)), 0) : 0;
  const totalTarget = Array.isArray(goals) ? goals.filter((g) => g.status === "ACTIVE").reduce((sum, g) => sum + parseFloat(String(g.targetAmount)), 0) : 0;

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
            <h1 className="text-3xl font-bold text-gray-900">{t.goalsPage.title}</h1>
            <p className="text-gray-600 mt-1">{t.goalsPage.subtitle}</p>
          </div>
          <button
            onClick={() => {
              // Set family if not already set
              if (!selectedFamilyId && families.length > 0) {
                setSelectedFamilyId(families[0].id);
              }
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t.goalsPage.addButton.replace('+ ', '')}
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
                  {totalSaved.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом
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
                  {totalTarget.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом
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
            <p className="text-gray-600">
              Создайте первую цель и начните откладывать деньги
            </p>
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
                        {parseFloat(String(goal.currentAmount)).toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом
                      </span>
                      <span className="text-sm text-gray-600">
                        из {parseFloat(String(goal.targetAmount)).toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом
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
                          Осталось: {(parseFloat(String(goal.targetAmount)) - parseFloat(String(goal.currentAmount))).toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом
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
                {/* Family Selector */}
                {families.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Семья *
                    </label>
                    <div className="relative">
                      <div
                        className="w-full border-2 border-gray-200 text-sm rounded-lg p-2.5 flex justify-between items-center cursor-pointer bg-white hover:border-[#0D6D6E] transition-colors"
                        onClick={() => setIsFamilyOpen(!isFamilyOpen)}
                      >
                        <span className="text-slate-900">
                          {selectedFamilyId 
                            ? families.find(f => f.id === selectedFamilyId)?.name || "Выберите семью"
                            : "Выберите семью"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isFamilyOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isFamilyOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsFamilyOpen(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                            {families.map((family) => (
                              <div
                                key={family.id}
                                className="p-2.5 text-sm hover:bg-[#0D6D6E]/10 hover:text-[#0D6D6E] cursor-pointer text-slate-700 transition-colors"
                                onClick={() => {
                                  setSelectedFamilyId(family.id);
                                  setIsFamilyOpen(false);
                                }}
                              >
                                {family.name}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

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
                    Целевая сумма (сом) *
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
                    Текущая сумма (сом)
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
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
                    Сумма вклада (сом) *
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
                    Осталось собрать: {(parseFloat(String(contributingGoal.targetAmount)) - parseFloat(String(contributingGoal.currentAmount))).toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом
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
                    <div className="relative">
                      <div
                        className="w-full border-2 border-gray-200 text-sm rounded-lg p-2.5 flex justify-between items-center cursor-pointer bg-white hover:border-[#0D6D6E] transition-colors"
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                      >
                        <span className="text-slate-900">
                          {selectedAccountId 
                            ? (() => {
                                const acc = accounts.find(a => a.id === selectedAccountId);
                                return acc ? `${acc.name} (${acc.balance.toLocaleString("ru-RU")} ${acc.currency})` : "Выберите счёт";
                              })()
                            : "Выберите счёт"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isAccountOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsAccountOpen(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                            {accounts.map((acc) => (
                              <div
                                key={acc.id}
                                className="p-2.5 text-sm hover:bg-[#0D6D6E]/10 hover:text-[#0D6D6E] cursor-pointer text-slate-700 transition-colors"
                                onClick={() => {
                                  setSelectedAccountId(acc.id);
                                  setIsAccountOpen(false);
                                }}
                              >
                                {acc.name} ({acc.balance.toLocaleString("ru-RU")} {acc.currency})
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
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
