'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthTestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Auth Status Debug
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status:
            </p>
            <p className="text-lg font-mono text-gray-900 dark:text-white">
              {status}
            </p>
          </div>

          {session && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                Session Data:
              </p>
              <pre className="text-sm text-green-900 dark:text-green-100 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}

          {!session && status !== 'loading' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                No session found. Please log in.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            {session ? (
              <>
                <Link
                  href="/admin"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-200 text-center"
                >
                  Go to Admin
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-200 text-center"
              >
                Go to Login
              </Link>
            )}
          </div>

          <Link
            href="/"
            className="block text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
