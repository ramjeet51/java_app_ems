import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'forest' | 'copper' | 'ink';
}

const toneClasses = {
  forest: 'bg-forest-50 text-forest-700',
  copper: 'bg-copper-100 text-copper-600',
  ink: 'bg-line text-ink',
};

export default function StatCard({ label, value, icon: Icon, tone = 'ink' }: StatCardProps) {
  return (
    <div className="ledger-card p-5 flex items-center gap-4">
      <div className={clsx('w-11 h-11 rounded-md flex items-center justify-center shrink-0', toneClasses[tone])}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-mono uppercase tracking-wide text-muted">{label}</p>
        <p className="text-2xl font-display font-medium text-ink tabular">{value}</p>
      </div>
    </div>
  );
}
