import React, { useEffect, useState } from 'react';
import { Alert, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AuthLayout from '../layouts/AuthLayout';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { auth } from '../firebase';
import { googleLogin, login, resendVerification } from '../services/authService';

export default function LoginPage({ setToken }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [alert, setAlert] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast, showToast, closeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('verified') === '1') {
      setAlert({ type: 'success', text: 'Email verified. You can sign in now.' });
      showToast('Email verified.');
    }
  }, [location.search, showToast]);

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const intervalId = setInterval(() => {
      setResendCooldown((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [resendCooldown]);

  const completeLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const response = await login(form);
      completeLogin(response.data.token);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Check your credentials.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
      if (error.response?.data?.unverified) {
        setShowResend(true);
        setEmailForResend(form.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await googleLogin(idToken);
      completeLogin(response.data.token);
    } catch {
      const message = 'Google sign-in failed. Try again.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerification(emailForResend);
      setAlert({ type: 'success', text: 'Verification email sent.' });
      showToast('Verification email sent.');
      setResendCooldown(30);
    } catch {
      const message = 'Verification email could not be sent.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <AuthLayout title="Welcome back" subtitle="Sign in to manage expenses and budgets.">
        <Stack component="form" onSubmit={handleLogin} spacing={2}>
          {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <Typography component={Link} to="/forgot-password" variant="body2" color="primary" sx={{ alignSelf: 'flex-end', fontWeight: 800 }}>
            Forgot password?
          </Typography>
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? 'Signing in' : 'Sign in'}
          </Button>
        </Stack>

        <Divider sx={{ my: 2.5 }}>or</Divider>

        <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} onClick={handleGoogleLogin} disabled={loading}>
          Continue with Google
        </Button>

        {showResend && (
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1.5 }}
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </Button>
        )}

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2.5 }}>
          New here?{' '}
          <Typography component={Link} to="/register" variant="body2" color="primary" sx={{ fontWeight: 800 }}>
            Create an account
          </Typography>
        </Typography>
      </AuthLayout>
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
