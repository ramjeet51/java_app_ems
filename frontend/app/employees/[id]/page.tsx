'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusStamp from '@/components/ui/StatusStamp';
import EmployeeForm from '@/components/forms/EmployeeForm';
import api, { unwrap } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type {
  AttendanceResponse,
  EmployeeRequest,
  EmployeeResponse,
  LeaveResponse,
  PayrollResponse,
  PerformanceReviewResponse,
} from '@/lib/types';

type Tab = 'profile' | 'attendance' | 'leaves' | 'payroll' | 'performance';

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leaves', label: 'Leaves' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'performance', label: 'Performance' },
];

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasRole } = useAuth();
  const canManage = hasRole('ROLE_ADMIN', 'ROLE_HR');

  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [tab, setTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    unwrap<EmployeeResponse>(api.get(`/employees/${id}`))
      .then(setEmployee)
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleUpdate(payload: EmployeeRequest) {
    const updated = await unwrap<EmployeeResponse>(api.put(`/employees/${id}`, payload));
    setEmployee(updated);
  }

  async function handleDelete() {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    await api.delete(`/employees/${id}`);
    router.push('/employees');
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <p className="text-sm text-muted font-mono">Loading employee…</p>
      </ProtectedLayout>
    );
  }

  if (!employee) {
    return (
      <ProtectedLayout>
        <p className="text-sm text-muted">Employee not found.</p>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <PageHeader
        title={employee.fullName}
        subtitle={`${employee.employeeCode} · ${employee.designation}, ${employee.department}`}
        action={
          <div className="flex items-center gap-3">
            <StatusStamp status={employee.status} />
            {canManage && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="flex gap-1 mb-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-forest-600 text-forest-700'
                : 'border-transparent text-muted hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card className="max-w-3xl">
          <EmployeeForm initial={employee} onSubmit={handleUpdate} submitLabel="Save changes" />
        </Card>
      )}
      {tab === 'attendance' && <AttendanceHistory employeeId={employee.id} />}
      {tab === 'leaves' && <LeaveHistory employeeId={employee.id} />}
      {tab === 'payroll' && <PayrollHistory employeeId={employee.id} />}
      {tab === 'performance' && <PerformanceHistory employeeId={employee.id} />}
    </ProtectedLayout>
  );
}

function AttendanceHistory({ employeeId }: { employeeId: number }) {
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    unwrap<AttendanceResponse[]>(api.get(`/attendance/employee/${employeeId}`))
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, [employeeId]);

  if (isLoading) return <p className="text-sm text-muted font-mono">Loading…</p>;

  return (
    <Card padded={false}>
      {records.length === 0 ? (
        <p className="text-sm text-muted p-6">No attendance records yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Date</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Check in</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Check out</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3 tabular">{r.attendanceDate}</td>
                <td className="px-5 py-3 tabular text-muted">{r.checkInTime || '—'}</td>
                <td className="px-5 py-3 tabular text-muted">{r.checkOutTime || '—'}</td>
                <td className="px-5 py-3"><StatusStamp status={r.status} /></td>
                <td className="px-5 py-3 text-muted">{r.remarks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function LeaveHistory({ employeeId }: { employeeId: number }) {
  const [records, setRecords] = useState<LeaveResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    unwrap<LeaveResponse[]>(api.get(`/leaves/employee/${employeeId}`))
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, [employeeId]);

  if (isLoading) return <p className="text-sm text-muted font-mono">Loading…</p>;

  return (
    <Card padded={false}>
      {records.length === 0 ? (
        <p className="text-sm text-muted p-6">No leave requests yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Type</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Dates</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Reason</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3">{r.leaveType.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3 tabular text-muted">{r.startDate} → {r.endDate}</td>
                <td className="px-5 py-3 text-muted max-w-xs truncate">{r.reason}</td>
                <td className="px-5 py-3"><StatusStamp status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function PayrollHistory({ employeeId }: { employeeId: number }) {
  const [records, setRecords] = useState<PayrollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    unwrap<PayrollResponse[]>(api.get(`/payroll/employee/${employeeId}`))
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, [employeeId]);

  if (isLoading) return <p className="text-sm text-muted font-mono">Loading…</p>;

  return (
    <Card padded={false}>
      {records.length === 0 ? (
        <p className="text-sm text-muted p-6">No payroll records yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Period</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Net salary</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3 tabular">{r.payPeriod}</td>
                <td className="px-5 py-3 tabular font-medium">${r.netSalary.toLocaleString()}</td>
                <td className="px-5 py-3"><StatusStamp status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function PerformanceHistory({ employeeId }: { employeeId: number }) {
  const [records, setRecords] = useState<PerformanceReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    unwrap<PerformanceReviewResponse[]>(api.get(`/performance/employee/${employeeId}`))
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, [employeeId]);

  if (isLoading) return <p className="text-sm text-muted font-mono">Loading…</p>;

  return (
    <Card padded={false}>
      {records.length === 0 ? (
        <p className="text-sm text-muted p-6">No performance reviews yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Period</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Reviewer</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Overall rating</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3 tabular">{r.reviewPeriod}</td>
                <td className="px-5 py-3 text-muted">{r.reviewerName}</td>
                <td className="px-5 py-3 tabular font-medium">{r.overallRating.toFixed(2)} / 10</td>
                <td className="px-5 py-3"><StatusStamp status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
