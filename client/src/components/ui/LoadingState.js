import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingState({ label = 'Loading' }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
      <CircularProgress size={26} thickness={4} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {label}
      </Typography>
    </Box>
  );
}
