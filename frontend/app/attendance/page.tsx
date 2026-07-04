'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusStamp from '@/components/ui/StatusStamp';
import { Input, Select } from '@/components/ui/FormFields';
import api, { unwrap } from '@/lib/api';
import type { AttendanceRequest, AttendanceResponse, AttendanceStatus, EmployeeResponse } from '@/lib/types';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'WORK_FROM_HOME', label: 'Work From Home' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'HOLIDAY', label: 'Holiday' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadRecords(d: string) {
    setIsLoading(true);
    try {
      const data = await unwrap<AttendanceResponse[]>(api.get(`/attendance/date/${d}`));
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRecords(date);
  }, [date]);

  useEffect(() => {
    unwrap<EmployeeResponse[]>(api.get('/employees')).then(setEmployees);
  }, []);

  return (
    <ProtectedLayout>
      <PageHeader
        title="Attendance"
        subtitle="Daily check-in / check-out records"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Mark Attendance
          </Button>
        }
      />

      <div className="mb-5 max-w-xs">
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted p-6">No attendance records for this date.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Employee</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Check in</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Check out</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-medium text-ink">{r.employeeName}</td>
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

      <MarkAttendanceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employees={employees}
        defaultDate={date}
        onMarked={() => {
          setModalOpen(false);
          loadRecords(date);
        }}
      />
    </ProtectedLayout>
  );
}

function MarkAttendanceModal({
  open,
  onClose,
  employees,
  defaultDate,
  onMarked,
}: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeResponse[];
  defaultDate: string;
  onMarked: () => void;
}) {
  const [form, setForm] = useState<AttendanceRequest>({
    employeeId: 0,
    attendanceDate: defaultDate,
    checkInTime: '',
    checkOutTime: '',
    status: 'PRESENT',
    remarks: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, attendanceDate: defaultDate }));
  }, [defaultDate, open]);

  function update<K extends keyof AttendanceRequest>(key: K, value: AttendanceRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.employeeId) {
      setError('Please select an employee.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/attendance', form);
      onMarked();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save attendance record.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark Attendance">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Employee"
          placeholder="Select employee"
          required
          options={employees.map((e) => ({ value: String(e.id), label: e.fullName }))}
          value={form.employeeId ? String(form.employeeId) : ''}
          onChange={(e) => update('employeeId', Number(e.target.value))}
        />
        <Input
          label="Date"
          type="date"
          required
          value={form.attendanceDate}
          onChange={(e) => update('attendanceDate', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Check in"
            type="time"
            value={form.checkInTime}
            onChange={(e) => update('checkInTime', e.target.value)}
          />
          <Input
            label="Check out"
            type="time"
            value={form.checkOutTime}
            onChange={(e) => update('checkOutTime', e.target.value)}
          />
        </div>
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => update('status', e.target.value as AttendanceStatus)}
        />
        <Input label="Remarks" value={form.remarks} onChange={(e) => update('remarks', e.target.value)} />

        {error && (
          <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
