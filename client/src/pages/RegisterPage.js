import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { register } from '../services/authService';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      await register(form);
      setAlert({ type: 'success', text: 'Account created. Check your email to verify it.' });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setAlert({ type: 'error', text: error.response?.data?.message || 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start tracking spend with a clean financial cockpit.">
      <Stack component="form" onSubmit={handleRegister} spacing={2}>
        {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
        <TextField label="Name" fullWidth required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <TextField label="Email" type="email" fullWidth required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <TextField label="Password" type="password" fullWidth required value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          Create account
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2.5 }}>
        Already have an account?{' '}
        <Typography component={Link} to="/login" variant="body2" color="primary" sx={{ fontWeight: 800 }}>
          Sign in
        </Typography>
      </Typography>
    </AuthLayout>
  );
}
