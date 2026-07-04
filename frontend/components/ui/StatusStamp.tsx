import clsx from 'clsx';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  CalendarOff,
  PartyPopper,
  AlertTriangle,
  Ban,
} from 'lucide-react';

type StampTone = 'forest' | 'copper' | 'danger' | 'muted';

const STATUS_CONFIG: Record<string, { tone: StampTone; icon: React.ElementType; label?: string }> = {
  // Employment status
  ACTIVE: { tone: 'forest', icon: CheckCircle2 },
  ON_LEAVE: { tone: 'copper', icon: CalendarOff },
  SUSPENDED: { tone: 'danger', icon: AlertTriangle },
  TERMINATED: { tone: 'muted', icon: Ban },
  // Attendance status
  PRESENT: { tone: 'forest', icon: CheckCircle2 },
  ABSENT: { tone: 'danger', icon: XCircle },
  HALF_DAY: { tone: 'copper', icon: Clock },
  WORK_FROM_HOME: { tone: 'forest', icon: Home, label: 'WFH' },
  HOLIDAY: { tone: 'muted', icon: PartyPopper },
  // Leave status
  PENDING: { tone: 'copper', icon: Clock },
  APPROVED: { tone: 'forest', icon: CheckCircle2 },
  REJECTED: { tone: 'danger', icon: XCircle },
  CANCELLED: { tone: 'muted', icon: Ban },
  // Payroll status
  PROCESSED: { tone: 'forest', icon: CheckCircle2 },
  PAID: { tone: 'forest', icon: CheckCircle2 },
  FAILED: { tone: 'danger', icon: XCircle },
  // Review status
  DRAFT: { tone: 'muted', icon: Clock },
  SUBMITTED: { tone: 'copper', icon: Clock },
  ACKNOWLEDGED: { tone: 'forest', icon: CheckCircle2 },
};

const toneClasses: Record<StampTone, string> = {
  forest: 'stamp-forest',
  copper: 'stamp-copper',
  danger: 'stamp-danger',
  muted: 'stamp-muted',
};

export default function StatusStamp({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { tone: 'muted' as StampTone, icon: Clock };
  const Icon = config.icon;
  const label = config.label || status.replace(/_/g, ' ');

  return (
    <span className={clsx(toneClasses[config.tone], '-rotate-1')}>
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}
