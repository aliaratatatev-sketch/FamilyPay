'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Home,
  CreditCard,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  ClipboardList,
  Bot,
  Bell,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useDashboardLocale } from '@/app/i18n/useDashboardLocale';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[]; // Роли семьи: 'CHILD', 'PARENT', 'ADMIN' или 'all'
  systemAdmin?: boolean; // Только для системного администратора
  separator?: boolean;
  translationKey?: string; // Ключ для перевода
}

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useDashboardLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userFamilyRole, setUserFamilyRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigation: NavigationItem[] = [
    { name: t.sidebar.home, href: '/dashboard', icon: Home, roles: ['all'], translationKey: 'home' },
    { name: t.sidebar.accounts, href: '/dashboard/accounts', icon: CreditCard, roles: ['all'], translationKey: 'accounts' },
    { name: t.sidebar.transactions, href: '/dashboard/transactions', icon: TrendingUp, roles: ['all'], translationKey: 'transactions' },
    { name: t.sidebar.budgets, href: '/dashboard/budgets', icon: DollarSign, roles: ['all'], translationKey: 'budgets' },
    { name: t.sidebar.goals, href: '/dashboard/goals', icon: Target, roles: ['all'], translationKey: 'goals' },
    { separator: true, name: '', href: '', icon: Home },
    { name: t.sidebar.family, href: '/dashboard/family', icon: Users, roles: ['all'], translationKey: 'family' },
    { name: t.sidebar.myRequests, href: '/dashboard/my-requests', icon: ClipboardList, roles: ['CHILD', 'TEEN'], translationKey: 'myRequests' },
    { name: t.sidebar.manageRequests, href: '/dashboard/manage-requests', icon: ClipboardList, roles: ['PARENT', 'ADMIN'], translationKey: 'manageRequests' },
    { separator: true, name: '', href: '', icon: Home },
    { name: t.sidebar.aiAssistant, href: '/dashboard/ai-assistant', icon: Bot, badge: 'NEW', roles: ['all'], translationKey: 'aiAssistant' },
    { name: t.sidebar.notifications, href: '/dashboard/notifications', icon: Bell, roles: ['all'], translationKey: 'notifications' },
    { separator: true, name: '', href: '', icon: Home },
    { name: t.sidebar.profile, href: '/dashboard/profile', icon: User, roles: ['all'], translationKey: 'profile' },
    { name: t.sidebar.adminPanel, href: '/admin', icon: Shield, systemAdmin: true, translationKey: 'adminPanel' },
  ];

  useEffect(() => {
    checkAdminAccess();
    loadUserFamilyRole();
    loadNotifications();
  }, [session]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/check-access');
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const loadUserFamilyRole = async () => {
    try {
      const response = await fetch('/api/families');
      const data = await response.json();
      
      if (response.ok && data.families && data.families.length > 0) {
        // Берем роль из первой семьи (можно улучшить для мультисемейного кейса)
        const firstFamily = data.families[0];
        const member = firstFamily.members.find((m: any) => m.user.id === session?.user?.id);
        setUserFamilyRole(member?.role || null);
      }
    } catch (error) {
      console.error('Error loading family role:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      const data = await response.json();
      
      if (response.ok) {
        setUnreadCount(data.notifications?.length || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const shouldShowItem = (item: NavigationItem): boolean => {
    // Сепараторы показываем всегда
    if (item.separator) return true;

    // Системная админка только для ADMIN роли
    if (item.systemAdmin) {
      return isAdmin;
    }

    // Если роли не указаны или 'all' - показываем всем
    if (!item.roles || item.roles.includes('all')) {
      return true;
    }

    // Проверяем роль пользователя в семье
    if (userFamilyRole && item.roles.includes(userFamilyRole)) {
      return true;
    }

    return false;
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const filteredNavigation = navigation.filter(shouldShowItem);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/5 shadow-lg"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-[#111d2b] border-r border-gray-200 dark:border-white/5 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src="/logo.png"
                    alt="FamilyPay"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
                    FamilyPay
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Личный кабинет</p>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/dashboard" className="flex justify-center w-full">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src="/logo.png"
                    alt="FamilyPay"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {filteredNavigation.map((item, index) => {
                if (item.separator) {
                  return (
                    <div
                      key={`separator-${index}`}
                      className="my-3 border-t border-gray-200 dark:border-white/5"
                    />
                  );
                }

                const Icon = item.icon;
                const active = isActive(item.href);
                const showBadge = item.badge || (item.href === '/dashboard/notifications' && unreadCount > 0);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white shadow-lg shadow-teal-500/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}

                    {/* Icon */}
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />

                    {/* Label */}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>

                        {/* Badge */}
                        {showBadge && (
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                              item.badge === 'NEW'
                                ? 'bg-yellow-400 text-yellow-900'
                                : active
                                ? 'bg-white/20 text-white'
                                : 'bg-[#0D6D6E] text-white'
                            }`}
                          >
                            {item.badge || unreadCount}
                          </span>
                        )}
                      </>
                    )}

                    {/* Collapsed badge */}
                    {isCollapsed && showBadge && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer - User info */}
          <div className="border-t border-gray-200 dark:border-white/5 p-4">
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {session?.user?.name || 'Пользователь'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userFamilyRole === 'CHILD' ? '👦 Ребенок' : 
                     userFamilyRole === 'PARENT' ? '👨‍💼 Родитель' : 
                     userFamilyRole === 'ADMIN' ? '👑 Администратор' : 
                     '👤 Пользователь'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                </div>
              </div>
            )}
          </div>

          {/* Toggle button - hide on mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-[#111d2b] border border-gray-200 dark:border-white/5 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shadow-md"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Spacer for main content - hide on mobile */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300`} />
    </>
  );
}
