"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KpiSparklineProps {
  data: number[];
  color: string;
  height?: number;
}

export default function KpiSparkline({ data, color, height = 28 }: KpiSparklineProps) {
  const points = data.map((value, index) => ({ index, value }));
  const gradientId = `kpi-sparkline-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 1, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.25}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}