'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/FormFields';
import api, { unwrap } from '@/lib/api';
import type { EmployeeResponse, UserResponse } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      const data = await unwrap<UserResponse[]>(api.get('/users'));
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    unwrap<EmployeeResponse[]>(api.get('/employees')).then(setEmployees);
  }, []);

  return (
    <ProtectedLayout allowedRoles={['ROLE_ADMIN', 'ROLE_HR']}>
      <PageHeader
        title="User Accounts"
        subtitle="Manage login accounts for employees"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Create User Account
          </Button>
        }
      />

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted p-6">No user accounts found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Name</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Email</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Role</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-medium text-ink">{u.fullName}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded">
                      {u.roles.map(r => r.replace('ROLE_', '')).join(', ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${u.enabled ? 'text-forest-600' : 'text-danger'}`}>
                      {u.enabled ? '✅ Active' : '❌ Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employees={employees}
        onCreated={() => { setModalOpen(false); load(); }}
      />
    </ProtectedLayout>
  );
}

function CreateUserModal({ open, onClose, employees, onCreated }: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeResponse[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
    employeeId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmployeeSelect(id: string) {
    const emp = employees.find(e => String(e.id) === id);
    setForm(prev => ({
      ...prev,
      employeeId: id,
      fullName: emp?.fullName || prev.fullName,
      email: emp?.email || prev.email,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        roles: [form.role],
        employeeId: form.employeeId ? Number(form.employeeId) : null,
      });
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create user account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create User Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Link to Employee (optional - auto fills name & email)"
          placeholder="Select employee"
          options={employees.map(e => ({ value: String(e.id), label: `${e.fullName} (${e.employeeCode})` }))}
          value={form.employeeId}
          onChange={e => handleEmployeeSelect(e.target.value)}
        />
        <Input
          label="Full Name"
          required
          value={form.fullName}
          onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
        />
        <Input
          label="Email (Login ID)"
          type="email"
          required
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
        />
        <Input
          label="Password"
          type="password"
          required
          placeholder="Min 6 characters"
          value={form.password}
          onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
        />
        <Select
          label="Role"
          options={[
            { value: 'ROLE_EMPLOYEE', label: '👤 Employee - Apna data dekh sakta hai' },
            { value: 'ROLE_MANAGER', label: '👔 Manager - Team manage kar sakta hai' },
            { value: 'ROLE_HR', label: '🏢 HR - Sab employees manage kar sakta hai' },
            { value: 'ROLE_ADMIN', label: '⚙️ Admin - Full access' },
          ]}
          value={form.role}
          onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
        />

        {error && (
          <div className="text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
