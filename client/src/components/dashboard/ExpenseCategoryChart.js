import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryData } from '../../utils/expenseUtils';
import { formatCurrency } from '../../utils/formatters';

const colors = ['#0F766E', '#7C3AED', '#F59E0B', '#2563EB', '#DC2626', '#64748B'];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {item.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {formatCurrency(item.value)}
      </Typography>
    </Box>
  );
}

export default function ExpenseCategoryChart({ expenses = [], data: providedData }) {
  const theme = useTheme();
  const data = (providedData || getCategoryData(expenses)).slice(0, 6);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length) {
    return (
      <Box sx={{ height: 280, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Category breakdown appears after your first expense.</Typography>
      </Box>
    );
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
      <Box sx={{ width: '100%', height: 280, minWidth: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={68} outerRadius={104} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} stroke={theme.palette.background.paper} strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Stack spacing={1.25} sx={{ width: '100%' }}>
        {data.map((item, index) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <Stack key={item.name} direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: colors[index % colors.length] }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pct}% of tracked spend
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {formatCurrency(item.value)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
