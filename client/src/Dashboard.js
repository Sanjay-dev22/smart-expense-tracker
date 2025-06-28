// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Grid, TextField, Button, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpenseChart from './ExpenseChart';
import ExpenseLineChart from './ExpenseLineChart';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import axios from 'axios';
import BudgetTracker from './BudgetTracker';

const API_URL = '${process.env.REACT_APP_API_URL}/api/expenses';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: '' });
  const [filters, setFilters] = useState({ category: 'all', fromDate: '', toDate: '' });
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form);
      fetchExpenses();
      setForm({ description: '', amount: '', category: '' });
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Authentication failed. Please log in again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = sortedExpenses.map(({ description, amount, category, createdAt }) => ({
      description,
      amount,
      category,
      date: new Date(createdAt).toLocaleDateString('en-GB')
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'expenses.csv');
  };

  const formatDateOnly = (dateStr) => new Date(dateStr).toISOString().split("T")[0];

  const filteredExpenses = expenses.filter((e) => {
    const expenseDate = formatDateOnly(e.createdAt);
    const matchCategory = filters.category === 'all' || e.category === filters.category;
    const matchFrom = !filters.fromDate || expenseDate >= filters.fromDate;
    const matchTo = !filters.toDate || expenseDate <= filters.toDate;
    const matchSearch = e.description.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchFrom && matchTo && matchSearch;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt); // Default: date-desc
  });

  return (

    <>
         <BudgetTracker expenses={expenses} />

      <Paper sx={{ p: 2, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                fullWidth
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Category"
                fullWidth
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box textAlign="right">
                <Button type="submit" variant="contained">Add Expense</Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Category"
              fullWidth
              SelectProps={{ native: true }}
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All</option>
              {[...new Set(expenses.map(e => e.category))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.fromDate}
              onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
              sx={{ mr: 2 }}
            />
            <TextField
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.toDate}
              onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          label="Search Description"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          select
          label="Sort By"
          fullWidth
          SelectProps={{ native: true }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date-desc">Date: Newest First</option>
          <option value="date-asc">Date: Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </TextField>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Expense Breakdown by Category</Typography>
        <ExpenseChart expenses={sortedExpenses} />
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Total Spent</Typography>
        <Typography variant="h4" color="primary">
          ₹{sortedExpenses.reduce((sum, item) => sum + Number(item.amount), 0)}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Daily Expense Trend</Typography>
        <ExpenseLineChart expenses={sortedExpenses} />
      </Paper>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" onClick={handleExportCSV}>
          Export to CSV
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Expense List</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedExpenses.map(exp => (
              <TableRow key={exp._id}>
                <TableCell>{exp.description}</TableCell>
                <TableCell>₹{exp.amount}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell>{new Date(exp.date || exp.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(exp._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}

export default Dashboard;
