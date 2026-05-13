import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState(null);
  const { toast, showToast, closeToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await forgotPassword(email);
      const message = response.data.message || 'Reset link sent.';
      setAlert({ type: 'success', text: message });
      showToast(message);
    } catch {
      const message = 'Reset link could not be sent.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
    }
  };

  return (
    <>
      <AuthLayout title="Reset access" subtitle="Enter your email and we will send reset instructions.">
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" variant="contained" fullWidth>
            Send reset link
          </Button>
        </Stack>
        <Typography component={Link} to="/login" variant="body2" color="primary" sx={{ display: 'block', mt: 2.5, textAlign: 'center', fontWeight: 800 }}>
          Back to sign in
        </Typography>
      </AuthLayout>
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
