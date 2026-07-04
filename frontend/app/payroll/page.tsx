'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusStamp from '@/components/ui/StatusStamp';
import { Input, Select } from '@/components/ui/FormFields';
import { useAuth } from '@/context/AuthContext';
import api, { unwrap } from '@/lib/api';
import type { EmployeeResponse, PayrollRequest, PayrollResponse } from '@/lib/types';

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function PayrollPage() {
  const { hasRole, user } = useAuth();
  const canManage = hasRole('ROLE_ADMIN', 'ROLE_HR');
  const isEmployee = hasRole('ROLE_EMPLOYEE') && !hasRole('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER');

  const [period, setPeriod] = useState('');
  const [records, setRecords] = useState<PayrollResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);

  async function load(p?: string) {
    setIsLoading(true);
    try {
      let data: PayrollResponse[];

      if (isEmployee && user?.employeeId) {
        // Employee sirf apna payroll dekhe
        data = await unwrap<PayrollResponse[]>(
          api.get(`/payroll/employee/${user.employeeId}`)
        );
      } else {
        // Admin/HR/Manager — sab ka payroll
        data = await unwrap<PayrollResponse[]>(
          api.get('/payroll', { params: p ? { period: p } : {} })
        );
      }
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user !== null) {
      load(period || undefined);
    }
  }, [period, user]);

  useEffect(() => {
    if (!isEmployee) {
      unwrap<EmployeeResponse[]>(api.get('/employees')).then(setEmployees).catch(() => {});
    }
  }, [isEmployee]);

  async function handleMarkPaid(id: number) {
    setMarkingId(id);
    try {
      await api.patch(`/payroll/${id}/mark-paid`);
      load(period || undefined);
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <ProtectedLayout>
      <PageHeader
        title="Payroll"
        subtitle={isEmployee ? 'Your monthly payslips' : 'Process and track monthly payroll'}
        action={
          canManage && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Process Payroll
            </Button>
          )
        }
      />

      {/* Period filter — sirf Admin/HR/Manager ke liye */}
      {!isEmployee && (
        <div className="mb-5 max-w-xs">
          <Input
            label="Filter by period"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      )}

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted p-6">No payroll records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {!isEmployee && (
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Employee</th>
                )}
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Period</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Basic</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Net Salary</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
                {canManage && <th className="px-5 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0">
                  {!isEmployee && (
                    <td className="px-5 py-3 font-medium text-ink">{r.employeeName}</td>
                  )}
                  <td className="px-5 py-3 tabular text-muted">{r.payPeriod}</td>
                  <td className="px-5 py-3 tabular">${r.basicSalary?.toLocaleString()}</td>
                  <td className="px-5 py-3 tabular font-medium">${r.netSalary?.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusStamp status={r.status} /></td>
                  {canManage && (
                    <td className="px-5 py-3 text-right">
                      {r.status === 'PROCESSED' && (
                        <button
                          onClick={() => handleMarkPaid(r.id)}
                          disabled={markingId === r.id}
                          className="text-forest-600 hover:text-forest-700 disabled:opacity-50 inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <CheckCircle2 size={14} /> Mark paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {canManage && (
        <ProcessPayrollModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          employees={employees}
          onProcessed={() => {
            setModalOpen(false);
            load(period || undefined);
          }}
        />
      )}
    </ProtectedLayout>
  );
}

function ProcessPayrollModal({
  open, onClose, employees, onProcessed,
}: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeResponse[];
  onProcessed: () => void;
}) {
  const [form, setForm] = useState<PayrollRequest>({
    employeeId: 0,
    payPeriod: currentPeriod(),
    basicSalary: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    tax: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof PayrollRequest>(key: K, value: PayrollRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEmployeeChange(id: number) {
    const emp = employees.find((e) => e.id === id);
    setForm((prev) => ({ ...prev, employeeId: id, basicSalary: emp?.baseSalary ?? prev.basicSalary }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.employeeId) { setError('Please select an employee.'); return; }
    setIsSubmitting(true);
    try {
      await api.post('/payroll/process', form);
      onProcessed();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not process payroll.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Process Payroll">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Employee"
          placeholder="Select employee"
          required
          options={employees.map((e) => ({ value: String(e.id), label: e.fullName }))}
          value={form.employeeId ? String(form.employeeId) : ''}
          onChange={(e) => handleEmployeeChange(Number(e.target.value))}
        />
        <Input label="Pay period" type="month" required value={form.payPeriod}
          onChange={(e) => update('payPeriod', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Basic salary" type="number" min={0} step="0.01" required
            value={form.basicSalary} onChange={(e) => update('basicSalary', parseFloat(e.target.value) || 0)} />
          <Input label="Allowances" type="number" min={0} step="0.01"
            value={form.allowances} onChange={(e) => update('allowances', parseFloat(e.target.value) || 0)} />
          <Input label="Bonus" type="number" min={0} step="0.01"
            value={form.bonus} onChange={(e) => update('bonus', parseFloat(e.target.value) || 0)} />
          <Input label="Deductions" type="number" min={0} step="0.01"
            value={form.deductions} onChange={(e) => update('deductions', parseFloat(e.target.value) || 0)} />
          <Input label="Tax" type="number" min={0} step="0.01"
            value={form.tax} onChange={(e) => update('tax', parseFloat(e.target.value) || 0)} />
        </div>
        {error && (
          <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">{error}</div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing…' : 'Process'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
