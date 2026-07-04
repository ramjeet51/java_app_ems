'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import AttendanceTrendChart from '@/components/charts/AttendanceTrendChart';
import DepartmentBreakdownChart from '@/components/charts/DepartmentBreakdownChart';
import { Wallet, Plane, TrendingUp } from 'lucide-react';
import api, { unwrap } from '@/lib/api';
import type { DashboardSummaryResponse, LeaveResponse, PayrollResponse } from '@/lib/types';

export default function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [leaves, setLeaves] = useState<LeaveResponse[]>([]);
  const [payroll, setPayroll] = useState<PayrollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      unwrap<DashboardSummaryResponse>(api.get('/reports/dashboard')),
      unwrap<LeaveResponse[]>(api.get('/leaves')),
      unwrap<PayrollResponse[]>(api.get('/payroll')),
    ])
      .then(([s, l, p]) => {
        setSummary(s);
        setLeaves(l);
        setPayroll(p);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const leavesByStatus = leaves.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const payrollByStatus = payroll.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + p.netSalary;
    return acc;
  }, {});

  const totalPayrollPaid = payrollByStatus.PAID || 0;
  const totalPayrollPending = (payrollByStatus.PENDING || 0) + (payrollByStatus.PROCESSED || 0);
  const totalLeavesApproved = leavesByStatus.APPROVED || 0;

  return (
    <ProtectedLayout allowedRoles={['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER']}>
      <PageHeader title="Reports" subtitle="Cross-functional view of workforce metrics" />

      {isLoading || !summary ? (
        <p className="text-sm text-muted font-mono">Loading reports…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Payroll paid (all time)" value={`$${totalPayrollPaid.toLocaleString()}`} icon={Wallet} tone="forest" />
            <StatCard label="Payroll pending" value={`$${totalPayrollPending.toLocaleString()}`} icon={TrendingUp} tone="copper" />
            <StatCard label="Leaves approved" value={totalLeavesApproved} icon={Plane} tone="forest" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader title="Attendance — last 7 days" />
              <AttendanceTrendChart data={summary.attendanceLast7Days} />
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader title="Headcount by department" />
              <DepartmentBreakdownChart data={summary.employeesByDepartment} />
            </Card>
          </div>

          <Card>
            <CardHeader title="Department breakdown" subtitle="Headcount per department" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-2 font-mono text-xs uppercase tracking-wide text-muted">Department</th>
                  <th className="py-2 font-mono text-xs uppercase tracking-wide text-muted">Headcount</th>
                  <th className="py-2 font-mono text-xs uppercase tracking-wide text-muted">Share</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.employeesByDepartment).map(([dept, count]) => (
                  <tr key={dept} className="border-b border-line last:border-b-0">
                    <td className="py-2.5 text-ink">{dept}</td>
                    <td className="py-2.5 tabular">{count}</td>
                    <td className="py-2.5 tabular text-muted">
                      {((count / summary.totalEmployees) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Leave requests by status" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(leavesByStatus).map(([status, count]) => (
                <div key={status} className="ledger-card p-4 text-center">
                  <p className="text-2xl font-display font-medium text-ink tabular">{count}</p>
                  <p className="text-xs font-mono uppercase tracking-wide text-muted mt-1">{status}</p>
                </div>
              ))}
              {Object.keys(leavesByStatus).length === 0 && (
                <p className="text-sm text-muted col-span-full">No leave data available.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </ProtectedLayout>
  );
}
