import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  LinearProgress,
  Alert,
  MenuItem
} from '@mui/material';
import axios from 'axios';

export default function BudgetTracker({ refreshExpenses, refreshTrigger }) {
  const [month, setMonth]   = useState(new Date().getMonth());
  const [year, setYear]     = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState(0);
  const [spent, setSpent]   = useState(0);
  const [newAmt, setNewAmt] = useState('');
  const [msg, setMsg]       = useState(null);

  const validYear = /^\d{4}$/.test(year);

  const fetchData = async () => {
    if (!validYear) return;
    const y = parseInt(year, 10);
    const token = localStorage.getItem('token');

    // 1) GET budget
    try {
      const bres = await axios.get(`${process.env.REACT_APP_API_URL}/api/budget`, {
        params: { month, year: y },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAmount(bres.data.budget || 0);
    } catch {
      setAmount(0);
    }

    // 2) GET spent this month
    try {
      const from = `${y}-${String(month+1).padStart(2,'0')}-01`;
      const to   = `${y}-${String(month+1).padStart(2,'0')}-31`;
      const eres = await axios.get(`${process.env.REACT_APP_API_URL}/api/expenses`, { 
        params: { fromDate: from, toDate: to, page:1, limit:1000000 },
        headers: { Authorization: `Bearer ${token}` }
      });
      const total = eres.data.expenses.reduce((s,e) => s + Number(e.amount), 0);
      setSpent(total);
    } catch {
      setSpent(0);
    }
  };

  // Re-fetch on month/year change or whenever parent signals a refresh
  useEffect(() => {
    fetchData();
    if (refreshExpenses) refreshExpenses();
  }, [month, year, refreshTrigger]); // <-- added refreshTrigger here

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validYear) {
      setMsg('Please enter a full 4-digit year before setting budget.');
      return;
    }
    const token = localStorage.getItem('token');
    const y = parseInt(year, 10);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/budget`,
        { month, year: y, amount: newAmt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('Budget set');
      setNewAmt('');
      fetchData();
    } catch {
      setMsg('Failed to set budget');
    }
  };

  const pct = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;

  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5">
        Budget for {year.padEnd(4, '_')}-{String(month+1).padStart(2,'0')}
      </Typography>

      <Box sx={{ display:'flex', gap:2, my:2 }}>
        <TextField
          select label="Month"
          value={month}
          onChange={e=>setMonth(+e.target.value)}
        >
          {Array.from({length:12},(_,i)=>
            <MenuItem key={i} value={i}>
              {new Date(0,i).toLocaleString('default',{month:'long'})}
            </MenuItem>
          )}
        </TextField>

        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={e=>setYear(e.target.value)}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height:10, borderRadius:5, mb:1 }}
        color={pct>=100?'error':'primary'}
      />
      <Typography>₹{spent.toFixed(2)} spent of ₹{amount}</Typography>

      {msg && <Alert severity={validYear ? 'success' : 'warning'} sx={{ my:2 }}>{msg}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt:2 }}>
        <TextField
          label="New Budget"
          type="number"
          fullWidth
          value={newAmt}
          onChange={e=>setNewAmt(e.target.value)}
        />
        <Button type="submit" fullWidth sx={{ mt:2 }}>Set Budget</Button>
      </Box>
    </Paper>
  );
}
