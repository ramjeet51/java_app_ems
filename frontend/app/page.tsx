'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? '/dashboard' : '/login');
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <p className="text-muted text-sm font-mono">Loading…</p>
    </div>
  );
}
