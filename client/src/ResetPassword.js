// src/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Missing or invalid token');
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2s
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 8, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Reset Password</Typography>

      <form onSubmit={handleResetPassword}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!token}
        >
          Reset Password
        </Button>
      </form>

      {message && (
        <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
          {message}
        </Typography>
      )}
    </Paper>
  );
}

export default ResetPassword;
