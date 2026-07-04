'use client';

import { useEffect, useState } from 'react';
import { Plus, Check, X as XIcon } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusStamp from '@/components/ui/StatusStamp';
import { Input, Select, TextArea } from '@/components/ui/FormFields';
import { useAuth } from '@/context/AuthContext';
import api, { unwrap } from '@/lib/api';
import type {
  EmployeeResponse,
  LeaveRequest,
  LeaveResponse,
  LeaveType,
} from '@/lib/types';

const LEAVE_TYPE_OPTIONS: { value: LeaveType; label: string }[] = [
  { value: 'SICK', label: 'Sick' },
  { value: 'CASUAL', label: 'Casual' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'MATERNITY', label: 'Maternity' },
  { value: 'PATERNITY', label: 'Paternity' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'BEREAVEMENT', label: 'Bereavement' },
];

export default function LeavesPage() {
  const { hasRole, user } = useAuth();
  const canReview = hasRole('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER');
  const isEmployee = hasRole('ROLE_EMPLOYEE') && !hasRole('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER');

  const [leaves, setLeaves] = useState<LeaveResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [myEmployee, setMyEmployee] = useState<EmployeeResponse | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    leave: LeaveResponse;
    decision: 'APPROVED' | 'REJECTED';
  } | null>(null);

  async function load(f: 'ALL' | 'PENDING') {
    setIsLoading(true);
    try {
      const data = await unwrap<LeaveResponse[]>(
        api.get(f === 'PENDING' ? '/leaves/pending' : '/leaves')
      );
      setLeaves(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load(filter);

    // Employees list fetch karo (Admin/HR/Manager ke liye)
    if (!isEmployee) {
      unwrap<EmployeeResponse[]>(api.get('/employees')).then(setEmployees);
    }

    // Employee ka apna record dhundo
    if (isEmployee && user?.email) {
      unwrap<EmployeeResponse[]>(api.get('/employees')).then((emps) => {
        const me = emps.find(e => e.email === user.email || e.fullName === user.fullName);
        if (me) setMyEmployee(me);
      });
    }
  }, [filter, isEmployee, user?.email]);

  return (
    <ProtectedLayout>
      <PageHeader
        title="Leaves"
        subtitle={isEmployee ? 'Apply for leave and track your requests' : 'Manage all leave requests'}
        action={
          <Button onClick={() => setApplyOpen(true)}>
            <Plus size={16} /> Apply for Leave
          </Button>
        }
      />

      {/* Filter — sirf Admin/HR/Manager ke liye */}
      {!isEmployee && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === 'ALL' ? 'bg-forest-50 text-forest-700' : 'text-muted hover:bg-paper'
            }`}
          >
            All requests
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === 'PENDING' ? 'bg-forest-50 text-forest-700' : 'text-muted hover:bg-paper'
            }`}
          >
            Pending only
          </button>
        </div>
      )}

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading…</p>
        ) : leaves.length === 0 ? (
          <p className="text-sm text-muted p-6">No leave requests found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {!isEmployee && (
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Employee</th>
                )}
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Type</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Dates</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Reason</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
                {canReview && <th className="px-5 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-b-0">
                  {!isEmployee && (
                    <td className="px-5 py-3 font-medium text-ink">{l.employeeName}</td>
                  )}
                  <td className="px-5 py-3">{l.leaveType?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3 tabular text-muted">
                    {l.startDate} → {l.endDate}
                  </td>
                  <td className="px-5 py-3 text-muted max-w-xs truncate">{l.reason}</td>
                  <td className="px-5 py-3">
                    <StatusStamp status={l.status} />
                  </td>
                  {canReview && (
                    <td className="px-5 py-3">
                      {l.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReviewTarget({ leave: l, decision: 'APPROVED' })}
                            className="text-forest-600 hover:text-forest-700"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setReviewTarget({ leave: l, decision: 'REJECTED' })}
                            className="text-danger hover:opacity-80"
                            title="Reject"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <ApplyLeaveModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        employees={employees}
        myEmployee={myEmployee}
        user={user}
        isEmployee={isEmployee}
        onApplied={() => {
          setApplyOpen(false);
          load(filter);
        }}
      />

      <ReviewLeaveModal
        target={reviewTarget}
        employees={employees}
        onClose={() => setReviewTarget(null)}
        onReviewed={() => {
          setReviewTarget(null);
          load(filter);
        }}
      />
    </ProtectedLayout>
  );
}

// ─── Apply Leave Modal ────────────────────────────────────────────────────────
function ApplyLeaveModal({
  open,
  onClose,
  employees,
  myEmployee,
  isEmployee,
  user,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeResponse[];
  myEmployee: EmployeeResponse | null;
  user: any;
  isEmployee: boolean;
  onApplied: () => void;
}) {
  const [form, setForm] = useState<LeaveRequest>({
    employeeId: 0,
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee ke liye auto-set employeeId
  useEffect(() => {
    if (isEmployee && (myEmployee || user?.employeeId)) {
      setForm(prev => ({ ...prev, employeeId: myEmployee?.id || user?.employeeId || 0 }));
    }
  }, [isEmployee, myEmployee, open, user]);

  function update<K extends keyof LeaveRequest>(key: K, value: LeaveRequest[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.employeeId) {
      setError('Employee select karo.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/leaves/apply', form);
      onApplied();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Employee select — sirf Admin/HR/Manager ke liye */}
        {!isEmployee && (
          <Select
            label="Employee"
            placeholder="Select employee"
            required
            options={employees.map(e => ({ value: String(e.id), label: e.fullName }))}
            value={form.employeeId ? String(form.employeeId) : ''}
            onChange={e => update('employeeId', Number(e.target.value))}
          />
        )}

        {/* Employee apna naam dekhe — readonly */}
        {isEmployee && myEmployee && (
          <div>
            <label className="form-label">Employee</label>
            <div className="form-input bg-paper text-muted cursor-not-allowed">
              {myEmployee.fullName}
            </div>
          </div>
        )}

        <Select
          label="Leave type"
          options={LEAVE_TYPE_OPTIONS}
          value={form.leaveType}
          onChange={e => update('leaveType', e.target.value as LeaveType)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start date"
            type="date"
            required
            value={form.startDate}
            onChange={e => update('startDate', e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            required
            value={form.endDate}
            onChange={e => update('endDate', e.target.value)}
          />
        </div>
        <TextArea
          label="Reason"
          required
          value={form.reason}
          onChange={e => update('reason', e.target.value)}
        />

        {error && (
          <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Review Leave Modal ───────────────────────────────────────────────────────
function ReviewLeaveModal({
  target,
  employees,
  onClose,
  onReviewed,
}: {
  target: { leave: LeaveResponse; decision: 'APPROVED' | 'REJECTED' } | null;
  employees: EmployeeResponse[];
  onClose: () => void;
  onReviewed: () => void;
}) {
  const [reviewerEmployeeId, setReviewerEmployeeId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReviewerEmployeeId(null);
    setComment('');
    setError(null);
  }, [target]);

  if (!target) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!reviewerEmployeeId) {
      setError('Please select who is reviewing this request.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch(`/leaves/${target!.leave.id}/review`, {
        decision: target!.decision,
        reviewerEmployeeId,
        comment,
      });
      onReviewed();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not submit review.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={target.decision === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          {target.leave.employeeName} — {target.leave.leaveType} ({target.leave.startDate} → {target.leave.endDate})
        </p>
        <Select
          label="Reviewed by"
          placeholder="Select reviewer"
          required
          options={employees.map(e => ({ value: String(e.id), label: e.fullName }))}
          value={reviewerEmployeeId ? String(reviewerEmployeeId) : ''}
          onChange={e => setReviewerEmployeeId(Number(e.target.value))}
        />
        <TextArea
          label="Comment (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        {error && (
          <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant={target.decision === 'APPROVED' ? 'primary' : 'danger'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : target.decision === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
