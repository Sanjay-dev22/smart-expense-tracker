import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper,
  Grid, TextField, Button, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import ExpenseChart from './ExpenseChart';
import ExpenseLineChart from './ExpenseLineChart';



// 🔁 Replace this with your actual Render backend API URL
  const API_URL = 'http://localhost:5000/api/expenses';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: ''
  });

  // Fetch expenses on load
  useEffect(() => {
    axios.get(API_URL).then(res => setExpenses(res.data));
  }, []);

  // Submit form
const handleSubmit = (e) => {
  e.preventDefault();
  axios.post(API_URL, form).then(() => {
    axios.get(API_URL).then(res => setExpenses(res.data)); // 🔁 refresh the full list
    setForm({ description: '', amount: '', category: '' });
  });
};

  // Delete expense
  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`).then(() => {
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Smart Expense Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        
        {/* Form Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Amount"
                  name="amount"
                  type="number"
                  fullWidth
                  required
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Category"
                  name="category"
                  fullWidth
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Box textAlign="right">
                  <Button type="submit" variant="contained">
                    Add Expense
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Pie Chart Section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Expense Breakdown by Category
          </Typography>
            <ExpenseChart expenses={expenses} />
        </Paper>

        {/* Total Spent */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Total Spent
          </Typography>
          <Typography variant="h4" color="primary">
            ₹{expenses.reduce((sum, item) => sum + Number(item.amount), 0)}
          </Typography>
        </Paper>

        {/* Line Chart */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Daily Expense Trend
          </Typography>
          <ExpenseLineChart expenses={expenses} />
        </Paper>


        {/* Expenses Table */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Expense List
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.description}</TableCell>
                  <TableCell>₹{exp.amount}</TableCell>
                  <TableCell>{exp.category}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(exp._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </>
  );
}

export default App;
