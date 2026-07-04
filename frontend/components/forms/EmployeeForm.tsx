'use client';

import { useEffect, useState } from 'react';
import { Input, Select, TextArea } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import api, { unwrap } from '@/lib/api';
import type { EmployeeRequest, EmployeeResponse, EmploymentStatus } from '@/lib/types';

const STATUS_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'TERMINATED', label: 'Terminated' },
];

interface EmployeeFormProps {
  initial?: EmployeeResponse;
  onSubmit: (payload: EmployeeRequest) => Promise<void>;
  submitLabel: string;
}

export default function EmployeeForm({ initial, onSubmit, submitLabel }: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeRequest>({
    fullName: initial?.fullName ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    department: initial?.department ?? '',
    designation: initial?.designation ?? '',
    status: initial?.status ?? 'ACTIVE',
    dateOfJoining: initial?.dateOfJoining ?? '',
    dateOfBirth: initial?.dateOfBirth ?? '',
    baseSalary: initial?.baseSalary ?? 0,
    managerId: initial?.managerId ?? null,
    address: initial?.address ?? '',
    profileImageUrl: initial?.profileImageUrl ?? '',
  });
  const [managers, setManagers] = useState<EmployeeResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    unwrap<EmployeeResponse[]>(api.get('/employees'))
      .then((data) => setManagers(data.filter((e) => e.id !== initial?.id)))
      .catch(() => setManagers([]));
  }, [initial?.id]);

  function update<K extends keyof EmployeeRequest>(key: K, value: EmployeeRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please check the form and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full name"
          required
          value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => update('status', e.target.value as EmploymentStatus)}
        />
        <Input
          label="Department"
          required
          value={form.department}
          onChange={(e) => update('department', e.target.value)}
          placeholder="e.g. Engineering"
        />
        <Input
          label="Designation"
          required
          value={form.designation}
          onChange={(e) => update('designation', e.target.value)}
          placeholder="e.g. Software Engineer"
        />
        <Input
          label="Date of joining"
          type="date"
          required
          value={form.dateOfJoining}
          onChange={(e) => update('dateOfJoining', e.target.value)}
        />
        <Input
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => update('dateOfBirth', e.target.value)}
        />
        <Input
          label="Base salary"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.baseSalary}
          onChange={(e) => update('baseSalary', parseFloat(e.target.value) || 0)}
        />
        <Select
          label="Manager"
          placeholder="No manager"
          options={managers.map((m) => ({ value: String(m.id), label: m.fullName }))}
          value={form.managerId ? String(form.managerId) : ''}
          onChange={(e) => update('managerId', e.target.value ? Number(e.target.value) : null)}
        />
        <Input
          label="Profile image URL"
          value={form.profileImageUrl}
          onChange={(e) => update('profileImageUrl', e.target.value)}
          placeholder="https://…"
        />
      </div>

      <TextArea label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />

      {error && (
        <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">{error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
