'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { UserCog,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Plane,
  Wallet,
  Award,
  ScrollText,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: Role[]; // omitted = visible to all authenticated roles
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/leaves', label: 'Leaves', icon: Plane },
  { href: '/payroll', label: 'Payroll', icon: Wallet },
  { href: '/performance', label: 'Performance', icon: Award },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
  { href: '/logs', label: 'Activity Logs', icon: ScrollText, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
  { href: '/users', label: 'User Accounts', icon: UserCog, roles: ['ROLE_ADMIN', 'ROLE_HR'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-line flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-forest-600 flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>
        <span className="font-display text-lg font-medium text-ink">Ledger</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-forest-50 text-forest-700'
                  : 'text-muted hover:bg-paper hover:text-ink'
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-5 py-4 border-t border-line">
          <p className="text-sm font-medium text-ink truncate">{user.fullName}</p>
          <p className="text-xs text-muted truncate">{user.roles.map((r) => r.replace('ROLE_', '')).join(', ')}</p>
        </div>
      )}
    </aside>
  );
}
