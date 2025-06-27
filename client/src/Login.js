import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


function Login({ setToken }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [showResend, setShowResend] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Try again.';
      alert(`❌ ${msg}`);

      if (err.response?.data?.unverified) {
      setShowResend(true);
      setEmailForResend(form.email);}
    }
  };

const location = useLocation();

useEffect(() => {
  const query = new URLSearchParams(location.search);
  if (query.get('verified') === '1') {
    alert('✅ Email verified successfully! You can now login.');
  }
}, [location]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post('http://localhost:5000/api/auth/google', { idToken });

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      alert('Google Sign-In failed. Try again.');
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 8, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Login</Typography>

      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Typography
           variant="body2"
          sx={{ mt: 1, textAlign: 'right', cursor: 'pointer', color: 'primary.main' }}
          onClick={() => navigate('/forgot-password')}
          > Forgot Password?
          </Typography>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>

      <Button onClick={handleGoogleLogin} variant="outlined" fullWidth sx={{ mt: 2 }}>
        Sign in with Google
      </Button>

      {showResend && (
  <Button
    variant="text"
    sx={{ mt: 2 }}
    onClick={async () => {
      try {
        await axios.post('http://localhost:5000/api/auth/resend-verification', { email: emailForResend });
        alert('Verification link has been sent again to your email.');
      } catch (err) {
        alert('Failed to resend verification link.');
        console.error(err);
      }
    }}
  >
    Resend Verification Email
  </Button>
)}

      <Typography variant="body2" sx={{ mt: 2 }}>
        Don't have an account?{' '}
        <Button onClick={() => navigate('/register')} size="small">
          Register
        </Button>
      </Typography>
    </Paper>
  );
}

export default Login;
