'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import api, { unwrap } from '@/lib/api';
import type { ActivityLogResponse, PageResponse } from '@/lib/types';

const PAGE_SIZE = 20;

export default function LogsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<ActivityLogResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    unwrap<PageResponse<ActivityLogResponse>>(api.get('/logs', { params: { page, size: PAGE_SIZE } }))
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <ProtectedLayout allowedRoles={['ROLE_ADMIN', 'ROLE_HR']}>
      <PageHeader title="Activity Logs" subtitle="System-wide audit trail" />

      <Card padded={false}>
        {isLoading ? (
          <p className="text-sm text-muted font-mono p-6">Loading…</p>
        ) : !data || data.content.length === 0 ? (
          <p className="text-sm text-muted p-6">No activity recorded yet.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Actor</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Action</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Details</th>
                  <th className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-muted">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((log) => (
                  <tr key={log.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3 text-ink">{log.actorEmail}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs uppercase tracking-wide text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted max-w-md truncate">{log.details || '—'}</td>
                    <td className="px-5 py-3 tabular text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-5 py-4 border-t border-line">
              <p className="text-xs text-muted font-mono">
                Page {data.number + 1} of {Math.max(data.totalPages, 1)} · {data.totalElements} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-md border border-line text-muted hover:text-ink disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.number + 1 >= data.totalPages}
                  className="p-1.5 rounded-md border border-line text-muted hover:text-ink disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </ProtectedLayout>
  );
}
