"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NotificationBell from "@/components/NotificationBell";
import { Home, User, LogOut, Shield } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
    if (session?.user) {
      checkAdminAccess();
    }
  }, [status, router, session]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/check-access');
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/logo.png"
                alt="FamilyPay"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              FamilyPay
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Info */}
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Добро пожаловать,
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {session?.user?.name || session?.user?.email}
              </p>
            </div>

            {/* User Menu */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Профиль</span>
            </Link>

            {/* Admin Panel Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline">Админ</span>
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}
    </div>
  );
}
