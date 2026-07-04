'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusStamp from '@/components/ui/StatusStamp';
import { useAuth } from '@/context/AuthContext';
import api, { unwrap } from '@/lib/api';
import type { EmployeeResponse } from '@/lib/types';

export default function EmployeesPage() {
  const { hasRole } = useAuth();
  const router = useRouter();
  const canManage = hasRole('ROLE_ADMIN', 'ROLE_HR');

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load(query?: string) {
    setIsLoading(true);
    try {
      const data = await unwrap<EmployeeResponse[]>(
        api.get('/employees', { params: query ? { search: query } : {} })
      );
      setEmployees(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(search || undefined);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ProtectedLayout>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} ${employees.length === 1 ? 'record' : 'records'}`}
        action={
          canManage && (
            <Button onClick={() => router.push('/employees/new')}>
              <Plus size={16} /> New Employee
            </Button>
          )
        }
      />

      <form onSubmit={handleSearchSubmit} className="mb-5 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department…"
            className="form-input pl-9"
          />
        </div>
      </form>

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading employees…</p>
        ) : employees.length === 0 ? (
          <p className="text-sm text-muted p-6">No employees found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted font-medium">Code</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted font-medium">Name</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted font-medium">Department</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted font-medium">Designation</th>
                <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-line last:border-b-0 hover:bg-paper/60 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted">{emp.employeeCode}</td>
                  <td className="px-5 py-3">
                    <Link href={`/employees/${emp.id}`} className="text-ink font-medium hover:text-forest-600">
                      {emp.fullName}
                    </Link>
                    <p className="text-xs text-muted">{emp.email}</p>
                  </td>
                  <td className="px-5 py-3 text-ink">{emp.department}</td>
                  <td className="px-5 py-3 text-ink">{emp.designation}</td>
                  <td className="px-5 py-3">
                    <StatusStamp status={emp.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/employees/${emp.id}`} className="text-muted hover:text-forest-600">
                        <Pencil size={15} />
                      </Link>
                      {canManage && (
                        <button
                          onClick={() => handleDelete(emp.id)}
                          disabled={deletingId === emp.id}
                          className="text-muted hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </ProtectedLayout>
  );
}
