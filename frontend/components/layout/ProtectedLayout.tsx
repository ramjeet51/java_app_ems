'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ProtectedLayout({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  console.log('[PROTECTED] isLoading:', isLoading, '| user:', user ? user.email : 'NULL');

  useEffect(() => {
    console.log('[PROTECTED] useEffect - isLoading:', isLoading, '| user:', user ? user.email : 'NULL');
    if (!isLoading && !user) {
      console.log('[PROTECTED] No user — redirecting to login');
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-muted text-sm font-mono">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-muted text-sm font-mono">Redirecting...</p>
      </div>
    );
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display text-xl text-ink mb-1">Access restricted</p>
              <p className="text-sm text-muted">You do not have permission to view this page.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
