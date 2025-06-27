// src/ForgotPassword.js
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage('Failed to send reset link');
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 8, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Forgot Password</Typography>
      <form onSubmit={handleForgotPassword}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Send Reset Link
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

export default ForgotPassword;
