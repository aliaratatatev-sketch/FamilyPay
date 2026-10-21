"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/app/components/ThemeToggle";
import LanguageSwitcher from "@/app/components/dashboard/LanguageSwitcher";
import UrgentNotificationListener from "@/app/components/UrgentNotificationListener";
import AudioUnlockPrompt from "@/app/components/AudioUnlockPrompt";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0D6D6E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Urgent Notification Listener - воспроизводит рингтон для срочных уведомлений */}
      <UrgentNotificationListener />
      
      {/* Audio Unlock Prompt - просит пользователя разрешить звук */}
      <AudioUnlockPrompt />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111d2b]/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/5">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Page title placeholder - can be filled by individual pages */}
            <div className="flex-1 ml-12 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {/* Dynamic title will be here */}
              </h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User info */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Добро пожаловать,
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session?.user?.name || session?.user?.email}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white text-sm font-semibold">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden lg:inline text-sm font-medium">Выйти</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
