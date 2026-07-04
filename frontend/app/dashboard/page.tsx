'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, CalendarOff, Clock } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import AttendanceTrendChart from '@/components/charts/AttendanceTrendChart';
import DepartmentBreakdownChart from '@/components/charts/DepartmentBreakdownChart';
import api, { unwrap } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { DashboardSummaryResponse } from '@/lib/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isAdminOrHrOrManager = hasRole('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER');

  return (
    <ProtectedLayout>
      {isAdminOrHrOrManager ? <AdminDashboard user={user} /> : <EmployeeDashboard user={user} />}
    </ProtectedLayout>
  );
}

// ─── Admin / HR / Manager Dashboard ───────────────────────────────────────────
function AdminDashboard({ user }: { user: any }) {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    unwrap<DashboardSummaryResponse>(api.get('/reports/dashboard'))
      .then(setSummary)
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] ?? ''}`}
        subtitle="Here's what's happening across your organization today."
      />

      {error && (
        <div className="mb-6 text-sm text-danger bg-[#F6E5E0] border border-[#E0B7A9] rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted font-mono">Loading dashboard…</p>
      ) : summary ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={summary.totalEmployees} icon={Users} tone="forest" />
            <StatCard label="Active" value={summary.activeEmployees} icon={UserCheck} tone="forest" />
            <StatCard label="On Leave Today" value={summary.onLeaveToday} icon={CalendarOff} tone="copper" />
            <StatCard label="Pending Leave Requests" value={summary.pendingLeaveRequests} icon={Clock} tone="copper" />
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader title="Attendance — last 7 days" />
              <AttendanceTrendChart data={summary.attendanceLast7Days} />
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader title="Headcount by department" />
              <DepartmentBreakdownChart data={summary.employeesByDepartment} />
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader title="Recent activity" />
              {summary.recentActivity.length === 0 ? (
                <p className="text-sm text-muted">No recent activity.</p>
              ) : (
                summary.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-line last:border-b-0">
                    <div>
                      <p className="text-sm text-ink">
                        <span className="font-medium">{activity.actorEmail}</span> — {activity.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      {activity.details && <p className="text-xs text-muted mt-0.5">{activity.details}</p>}
                    </div>
                    <p className="text-xs text-muted font-mono shrink-0 ml-4">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </Card>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}

// ─── Employee Dashboard ────────────────────────────────────────────────────────
function EmployeeDashboard({ user }: { user: any }) {
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Employee ka employeeId nahi hota directly, sirf leaves aur attendance fetch karte hain
    Promise.allSettled([
      unwrap<any[]>(api.get('/leaves')),
      unwrap<any[]>(api.get('/attendance')),
    ]).then(([leavesRes, attendanceRes]) => {
      if (leavesRes.status === 'fulfilled') setMyLeaves(leavesRes.value.slice(0, 5));
      if (attendanceRes.status === 'fulfilled') setMyAttendance(attendanceRes.value.slice(0, 5));
    }).finally(() => setIsLoading(false));
  }, []);

  const pendingLeaves = myLeaves.filter(l => l.status === 'PENDING').length;
  const approvedLeaves = myLeaves.filter(l => l.status === 'APPROVED').length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] ?? ''} 👋`}
        subtitle="Your personal dashboard — attendance, leaves and more."
      />

      {isLoading ? (
        <p className="text-sm text-muted font-mono">Loading…</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* Quick stats */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Pending Leaves" value={pendingLeaves} icon={Clock} tone="copper" />
            <StatCard label="Approved Leaves" value={approvedLeaves} icon={UserCheck} tone="forest" />
            <StatCard label="Total Requests" value={myLeaves.length} icon={CalendarOff} tone="ink" />
          </motion.div>

          {/* Recent leaves */}
          <motion.div variants={item}>
            <Card>
              <CardHeader title="My Recent Leave Requests" />
              {myLeaves.length === 0 ? (
                <p className="text-sm text-muted">No leave requests yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="py-2 font-mono text-xs uppercase tracking-wide text-muted">Type</th>
                      <th className="py-2 font-mono text-xs uppercase tracking-wide text-muted">Dates</th>
                      <th className="py-2 font-mono text-xs uppercase tracking-wide text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.map((l: any) => (
                      <tr key={l.id} className="border-b border-line last:border-b-0">
                        <td className="py-2.5 text-ink">{l.leaveType}</td>
                        <td className="py-2.5 tabular text-muted">{l.startDate} → {l.endDate}</td>
                        <td className="py-2.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            l.status === 'APPROVED' ? 'bg-forest-50 text-forest-700' :
                            l.status === 'REJECTED' ? 'bg-[#F6E5E0] text-danger' :
                            'bg-copper-100 text-copper-600'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </motion.div>

          {/* Quick links */}
          <motion.div variants={item}>
            <Card>
              <CardHeader title="Quick Actions" />
              <div className="flex gap-3 flex-wrap">
                <a href="/leaves" className="px-4 py-2 bg-forest-600 text-white text-sm rounded-md hover:bg-forest-700">
                  Apply for Leave
                </a>
                <a href="/attendance" className="px-4 py-2 border border-line text-ink text-sm rounded-md hover:bg-paper">
                  View Attendance
                </a>
                <a href="/payroll" className="px-4 py-2 border border-line text-ink text-sm rounded-md hover:bg-paper">
                  View Payslip
                </a>
              </div>
            </Card>
          </motion.div>

        </motion.div>
      )}
    </>
  );
}
