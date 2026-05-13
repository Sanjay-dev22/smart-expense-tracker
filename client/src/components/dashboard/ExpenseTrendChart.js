import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDailyTrendData } from '../../utils/expenseUtils';
import { compactNumber, formatCurrency } from '../../utils/formatters';

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {new Date(label).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

export default function ExpenseTrendChart({ expenses = [], data: providedData }) {
  const theme = useTheme();
  const data = providedData || getDailyTrendData(expenses);

  if (!data.length) {
    return (
      <Box sx={{ height: 280, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Daily trends will render as spending history builds.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={compactNumber}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<TrendTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0F766E"
            strokeWidth={3}
            fill="url(#spendGradient)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
