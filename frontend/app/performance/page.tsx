'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusStamp from '@/components/ui/StatusStamp';
import { Input, Select, TextArea } from '@/components/ui/FormFields';
import { useAuth } from '@/context/AuthContext';
import api, { unwrap } from '@/lib/api';
import type { EmployeeResponse, PerformanceReviewRequest, PerformanceReviewResponse } from '@/lib/types';

export default function PerformancePage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER');

  const [records, setRecords] = useState<PerformanceReviewResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const data = await unwrap<PerformanceReviewResponse[]>(api.get('/performance'));
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    unwrap<EmployeeResponse[]>(api.get('/employees')).then(setEmployees);
  }, []);

  return (
    <ProtectedLayout>
      <PageHeader
        title="Performance Reviews"
        subtitle="Track quarterly and annual performance evaluations"
        action={
          canCreate && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> New Review
            </Button>
          )
        }
      />

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted p-6">No performance reviews recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Employee</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Reviewer</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Period</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Overall</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-medium text-ink">{r.employeeName}</td>
                  <td className="px-5 py-3 text-muted">{r.reviewerName}</td>
                  <td className="px-5 py-3 tabular text-muted">{r.reviewPeriod}</td>
                  <td className="px-5 py-3 tabular font-medium">{r.overallRating.toFixed(2)} / 10</td>
                  <td className="px-5 py-3"><StatusStamp status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <NewReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employees={employees}
        onCreated={() => {
          setModalOpen(false);
          load();
        }}
      />
    </ProtectedLayout>
  );
}

function NewReviewModal({
  open,
  onClose,
  employees,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeResponse[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState<PerformanceReviewRequest>({
    employeeId: 0,
    reviewerId: 0,
    reviewPeriod: '',
    reviewDate: new Date().toISOString().slice(0, 10),
    productivityScore: 7,
    qualityScore: 7,
    teamworkScore: 7,
    communicationScore: 7,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    status: 'SUBMITTED',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof PerformanceReviewRequest>(key: K, value: PerformanceReviewRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.employeeId || !form.reviewerId) {
      setError('Please select both the employee and the reviewer.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/performance', form);
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save performance review.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Performance Review" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Employee"
            placeholder="Select employee"
            required
            options={employees.map((e) => ({ value: String(e.id), label: e.fullName }))}
            value={form.employeeId ? String(form.employeeId) : ''}
            onChange={(e) => update('employeeId', Number(e.target.value))}
          />
          <Select
            label="Reviewer"
            placeholder="Select reviewer"
            required
            options={employees.map((e) => ({ value: String(e.id), label: e.fullName }))}
            value={form.reviewerId ? String(form.reviewerId) : ''}
            onChange={(e) => update('reviewerId', Number(e.target.value))}
          />
          <Input
            label="Review period"
            required
            placeholder="e.g. Q2 2026"
            value={form.reviewPeriod}
            onChange={(e) => update('reviewPeriod', e.target.value)}
          />
          <Input
            label="Review date"
            type="date"
            required
            value={form.reviewDate}
            onChange={(e) => update('reviewDate', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Input
            label="Productivity (1-10)"
            type="number"
            min={1}
            max={10}
            required
            value={form.productivityScore}
            onChange={(e) => update('productivityScore', Number(e.target.value))}
          />
          <Input
            label="Quality (1-10)"
            type="number"
            min={1}
            max={10}
            required
            value={form.qualityScore}
            onChange={(e) => update('qualityScore', Number(e.target.value))}
          />
          <Input
            label="Teamwork (1-10)"
            type="number"
            min={1}
            max={10}
            required
            value={form.teamworkScore}
            onChange={(e) => update('teamworkScore', Number(e.target.value))}
          />
          <Input
            label="Communication (1-10)"
            type="number"
            min={1}
            max={10}
            required
            value={form.communicationScore}
            onChange={(e) => update('communicationScore', Number(e.target.value))}
          />
        </div>

        <TextArea label="Strengths" value={form.strengths} onChange={(e) => update('strengths', e.target.value)} />
        <TextArea
          label="Areas for improvement"
          value={form.areasForImprovement}
          onChange={(e) => update('areasForImprovement', e.target.value)}
        />
        <TextArea label="Goals" value={form.goals} onChange={(e) => update('goals', e.target.value)} />

        {error && (
          <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
