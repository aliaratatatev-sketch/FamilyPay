'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthAwareLinkProps {
  children: ReactNode;
  className?: string;
  unauthenticatedHref?: string;
  authenticatedHref?: string;
}

/**
 * Кнопка-ссылка, которая направляет пользователя:
 * - Если НЕ залогинен → на страницу входа (/login)
 * - Если залогинен → на дашборд (/dashboard)
 */
export default function AuthAwareLink({
  children,
  className = '',
  unauthenticatedHref = '/login',
  authenticatedHref = '/dashboard',
}: AuthAwareLinkProps) {
  const { data: session, status } = useSession();

  const href = status === 'authenticated' ? authenticatedHref : unauthenticatedHref;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
