import React from 'react';
import { Paper, Stack, Typography, Box } from '@mui/material';

export default function MetricCard({ label, value, helper, icon, tone = 'primary' }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        minHeight: 136,
        transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
        '&:hover': {
          borderColor: `${tone}.main`,
          boxShadow: '0 16px 38px rgba(16, 24, 40, 0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h3" sx={{ mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            color: `${tone}.main`,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,118,110,0.08)',
          }}
        >
          {icon}
        </Box>
      </Stack>
      {helper && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {helper}
        </Typography>
      )}
    </Paper>
  );
}
