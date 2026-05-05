import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';

export default function Panel({ title, eyebrow, action, children, sx }) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      {(title || eyebrow || action) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <div>
            {eyebrow && (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                {eyebrow}
              </Typography>
            )}
            {title && <Typography variant="h4">{title}</Typography>}
          </div>
          {action}
        </Stack>
      )}
      {children}
    </Paper>
  );
}
