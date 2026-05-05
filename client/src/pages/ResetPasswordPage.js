import React, { useEffect, useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { resetPassword } from '../services/authService';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) setAlert({ type: 'error', text: 'Missing or invalid reset token.' });
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await resetPassword({ token, password });
      setAlert({ type: 'success', text: response.data.message || 'Password reset.' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setAlert({ type: 'error', text: error.response?.data?.message || 'Password reset failed.' });
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a new password for your account.">
      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
        <TextField label="New password" type="password" fullWidth required value={password} onChange={(event) => setPassword(event.target.value)} />
        <Button type="submit" variant="contained" fullWidth disabled={!token}>
          Reset password
        </Button>
      </Stack>
    </AuthLayout>
  );
}
