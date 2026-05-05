import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await forgotPassword(email);
      setAlert({ type: 'success', text: response.data.message || 'Reset link sent.' });
    } catch {
      setAlert({ type: 'error', text: 'Reset link could not be sent.' });
    }
  };

  return (
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
  );
}
