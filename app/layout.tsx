import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "./i18n/LocaleContext";
import SessionProvider from "./providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FamilyPay — Семейный бюджет под контролем",
  description:
    "Управляйте финансами всей семьи в одном приложении. Планируйте бюджет, достигайте целей и следите за расходами вместе.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
