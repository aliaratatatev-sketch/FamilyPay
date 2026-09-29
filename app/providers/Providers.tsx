'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from '../i18n/LocaleContext';
import SessionProvider from './SessionProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </SessionProvider>
  );
}
