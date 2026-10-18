"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function JoinFamilyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [familyName, setFamilyName] = useState("");

  useEffect(() => {
    // Проверяем наличие токена
    if (!token) {
      setError("Токен приглашения не найден");
      return;
    }

    // Получаем информацию о приглашении
    const fetchInvitationInfo = async () => {
      try {
        const response = await fetch(`/api/invitations/info?token=${token}`);
        const data = await response.json();

        if (response.ok && data.familyName) {
          setFamilyName(data.familyName);
        }
      } catch (err) {
        console.error("Ошибка при получении информации о приглашении:", err);
      }
    };

    fetchInvitationInfo();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError("Токен приглашения не найден");
      return;
    }

    if (status !== "authenticated") {
      setError("Необходимо войти в систему");
      router.push(`/login?callbackUrl=/join?token=${token}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешное принятие приглашения
        router.push("/dashboard");
      } else {
        setError(data.error || "Не удалось принять приглашение");
      }
    } catch (err) {
      console.error("Ошибка при принятии приглашения:", err);
      setError("Произошла ошибка. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Ошибка
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Токен приглашения не найден или недействителен
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full min-h-[44px] bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full">
        {/* Иконка */}
        <div className="mb-4 sm:mb-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Приглашение в семью
          </h1>

          {familyName && (
            <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
              Семья: <span className="font-semibold">{familyName}</span>
            </p>
          )}

          <p className="text-sm sm:text-base text-gray-600">
            Нажмите кнопку ниже, чтобы присоединиться к семье и начать управлять финансами вместе
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Кнопка */}
        <button
          onClick={handleAcceptInvitation}
          disabled={loading || status !== "authenticated"}
          className={`w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-lg font-medium text-white transition-all text-sm sm:text-base ${
            loading || status !== "authenticated"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Обработка...
            </span>
          ) : status !== "authenticated" ? (
            "Войдите, чтобы принять приглашение"
          ) : (
            "Принять приглашение"
          )}
        </button>

        {status !== "authenticated" && (
          <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
            У вас еще нет аккаунта?{" "}
            <a
              href={`/login?callbackUrl=/join?token=${token}`}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Войти или зарегистрироваться
            </a>
          </p>
        )}
      </div>
    </div>
  );
}


export default function JoinFamilyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl">Загрузка...</div>
      </div>
    }>
      <JoinFamilyPageContent />
    </Suspense>
  );
}
