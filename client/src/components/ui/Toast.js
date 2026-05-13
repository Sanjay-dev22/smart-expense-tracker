import React from 'react';
import { Alert, Snackbar } from '@mui/material';

export default function Toast({ toast, onClose }) {
  return (
    <Snackbar
      open={Boolean(toast)}
      autoHideDuration={3600}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {toast ? (
        <Alert elevation={0} severity={toast.severity} onClose={onClose} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
