'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-line bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-sm text-muted">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-sm font-medium font-display">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
