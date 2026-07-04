'use client';

import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import EmployeeForm from '@/components/forms/EmployeeForm';
import api from '@/lib/api';
import type { EmployeeRequest } from '@/lib/types';

export default function NewEmployeePage() {
  const router = useRouter();

  async function handleSubmit(payload: EmployeeRequest) {
    const res = await api.post('/employees', payload);
    const newId = res.data?.data?.id;
    router.push(newId ? `/employees/${newId}` : '/employees');
  }

  return (
    <ProtectedLayout allowedRoles={['ROLE_ADMIN', 'ROLE_HR']}>
      <PageHeader title="New Employee" subtitle="Add a new record to the ledger" />
      <Card className="max-w-3xl">
        <EmployeeForm onSubmit={handleSubmit} submitLabel="Create Employee" />
      </Card>
    </ProtectedLayout>
  );
}
