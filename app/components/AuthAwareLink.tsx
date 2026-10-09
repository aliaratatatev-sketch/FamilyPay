'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthAwareLinkProps {
  children: ReactNode;
  className?: string;
  unauthenticatedHref?: string;
  authenticatedHref?: string;
  mode?: 'login' | 'register';
}

/**
 * Кнопка-ссылка, которая направляет пользователя:
 * - Если НЕ залогинен → на страницу входа (/login) или регистрации (/login?mode=register)
 * - Если залогинен → на дашборд (/dashboard)
 */
export default function AuthAwareLink({
  children,
  className = '',
  unauthenticatedHref = '/login',
  authenticatedHref = '/dashboard',
  mode,
}: AuthAwareLinkProps) {
  const { data: session, status } = useSession();

  let href = status === 'authenticated' ? authenticatedHref : unauthenticatedHref;
  
  // Если указан mode и пользователь не аутентифицирован, добавляем параметр mode
  if (status !== 'authenticated' && mode && !href.includes('?')) {
    href = `${href}?mode=${mode}`;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
