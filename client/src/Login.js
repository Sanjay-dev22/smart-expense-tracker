// src/Login.js
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { auth } from './firebase'; // make sure you create this
import './firebase'; // ✅ Correct if firebase.js is directly under src/


function Login({ setToken }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Login failed. Check email or password');
    }
  };

  // Google Sign-In Handler
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      console.log("🔥 Firebase ID Token:", idToken);
      const res = await axios.post('http://localhost:5000/api/auth/google', { idToken });

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      alert('Google Sign-In failed');
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
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>

      <Button
        onClick={handleGoogleLogin}
        variant="outlined"
        fullWidth
        sx={{ mt: 2 }}
      >
        Sign in with Google
      </Button>

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
