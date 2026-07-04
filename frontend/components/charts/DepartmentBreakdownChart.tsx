'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DepartmentBreakdownChartProps {
  data: Record<string, number>;
}

const COLORS = ['#3C6B4C', '#C77D3D', '#7FA98A', '#E0AD74', '#2D5C3F', '#A8632D', '#8A8578'];

export default function DepartmentBreakdownChart({ data }: DepartmentBreakdownChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E6E3DC',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'var(--font-inter)',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-inter)', color: '#1C1B19' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
