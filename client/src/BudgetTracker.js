// src/BudgetTracker.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

function BudgetTracker({ expenses }) {
  const [budget, setBudget] = useState(0);
  const [newBudget, setNewBudget] = useState('');
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('${process.env.REACT_APP_API_URL}/api/budget', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBudget(res.data.budget || 0);
    } catch (err) {
      console.error('Failed to fetch budget', err);
      setError('Failed to fetch budget');
    }
  };

  fetchBudget();
}, []);


  useEffect(() => {
    if (!expenses || !Array.isArray(expenses)) return;

    const currentMonth = new Date().getMonth();
    const total = expenses.reduce((sum, exp) => {
      const expDate = new Date(exp.date || exp.createdAt);
      return expDate.getMonth() === currentMonth ? sum + Number(exp.amount) : sum;
    }, 0);

    setMonthlyTotal(total);
  }, [expenses, budget]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post('${process.env.REACT_APP_API_URL}/api/budget',
      { amount: newBudget },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setBudget(res.data.budget);
    setNewBudget('');
    setSuccess('Budget updated successfully');
    setTimeout(() => setSuccess(null), 2000);
  } catch (err) {
    console.error('Failed to update budget:', err);
    setError('Failed to update budget');
  }
};


  const progressPercent = budget > 0 ? Math.min((monthlyTotal / budget) * 100, 100) : 0;

  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>Monthly Budget Overview</Typography>

      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{ height: 10, borderRadius: 5, my: 2 }}
        color={progressPercent >= 100 ? 'error' : 'primary'}
      />

      <Typography variant="body1" sx={{ mb: 1 }}>
        ₹{monthlyTotal.toFixed(2)} spent of ₹{budget}
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Set Monthly Budget (₹)"
          type="number"
          fullWidth
          value={newBudget}
          onChange={(e) => setNewBudget(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button variant="contained" fullWidth type="submit">
          Update Budget
        </Button>
      </Box>
    </Paper>
  );
}

export default BudgetTracker;
