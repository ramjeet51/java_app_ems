'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AttendanceTrendChartProps {
  data: Record<string, number>; // e.g. { "06-15": 42, "06-16": 45, ... }
}

export default function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  const chartData = Object.entries(data).map(([date, count]) => ({ date, count }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6E3DC" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#8A8578', fontFamily: 'var(--font-jetbrains)' }}
          axisLine={{ stroke: '#E6E3DC' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#8A8578', fontFamily: 'var(--font-jetbrains)' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E6E3DC',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'var(--font-inter)',
          }}
          cursor={{ fill: '#EEF3EE' }}
        />
        <Bar dataKey="count" fill="#3C6B4C" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
