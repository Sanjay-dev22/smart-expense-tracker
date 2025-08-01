import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper, Typography, Grid, TextField, Button, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import axios from 'axios';

import ExpenseChart from './ExpenseChart';
import ExpenseLineChart from './ExpenseLineChart';
import BudgetTracker from './BudgetTracker';

const API_URL = `${process.env.REACT_APP_API_URL}/api/expenses`;

// Predefined common categories
const commonCategories = [
  'Groceries', 'Utilities', 'Rent / Housing', 'Food & Drink', 'Transport',
  'Shopping', 'Entertainment', 'Health', 'Education', 'Travel',
  'Personal Care', 'Insurance', 'Gifts & Donations', 'EMIs / Loans',
  'Savings & Investments', 'Miscellaneous'
];

export default function Dashboard() {
  // --- Form & Edit State ---
  const [form, setForm] = useState({ description: '', amount: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  // --- Filter/Search/Sort/Pagination State ---
  const [filters, setFilters] = useState({ category: 'all', fromDate: '', toDate: '' });
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expenses, setExpenses] = useState([]);       // paginated data
  const [allExpenses, setAllExpenses] = useState([]); // full filtered data
  const [categoriesList, setCategoriesList] = useState(commonCategories);
  const [categoryInput, setCategoryInput] = useState('All Categories');
  const limit = 10;
  const [budgetRefresh, setBudgetRefresh] = useState(0);

  // Merge any new categories from server into categoriesList
  const mergeCategories = cats => {
    setCategoriesList(prev =>
      Array.from(new Set([...commonCategories, ...prev, ...cats]))
    );
  };

  // Reload table when budget month/year changes
  const refreshExpenses = () => fetchExpenses();

  // --- Fetch paginated data for table & pagination ---
  const fetchExpenses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const params = {
        page,
        limit,
        ...(filters.category !== 'all' && { category: filters.category }),
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        search: searchText
      };

      const res = await axios.get(API_URL, { params });
      const {
        expenses: srvExpenses = [],
        page: srvPage = 1,
        totalPages: srvTotal = 1
      } = res.data;

      setExpenses(srvExpenses);
      setTotalPages(srvTotal);
      setPage(Math.min(srvPage, srvTotal));
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
      setTotalPages(1);
      setPage(1);
    }
  }, [page, filters, searchText]);

  // --- Fetch ALL filtered data for charts & dropdowns ---
  const fetchAllExpenses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const params = {
        page: 1,
        limit: 1000000,
        ...(filters.category !== 'all' && { category: filters.category }),
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        search: searchText
      };

      const res = await axios.get(API_URL, { params });
      setAllExpenses(res.data.expenses || []);

      // Update categoriesList with any new categories
      const newCats = res.data.expenses.map(e => e.category);
      mergeCategories(newCats);
    } catch (err) {
      console.error('Failed to fetch all expenses:', err);
      setAllExpenses([]);
    }
  }, [filters, searchText]);

  // On mount, seed categoriesList
  useEffect(() => {
    axios
      .get(API_URL, { params: { page: 1, limit: 1000000 } })
      .then(res => {
        const cats = res.data.expenses.map(e => e.category);
        mergeCategories(cats);
      })
      .catch(console.error);
  }, []);

  // Initial and reactive fetches
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchAllExpenses();
    setPage(1);
  }, [filters, searchText, fetchAllExpenses]);

  // Also refetch whenever filters change (handles clearFilters immediately)
  useEffect(() => {
    fetchExpenses();
    fetchAllExpenses();
  }, [filters]);

  // --- CRUD Handlers ---
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form);

      // Add new category if needed
      if (form.category && !categoriesList.includes(form.category)) {
        mergeCategories([form.category]);
      }

      setForm({ description: '', amount: '', category: '' });
      fetchExpenses();
      fetchAllExpenses();
      setBudgetRefresh(r => r + 1);
    } catch {
      alert('Failed to add expense. Please log in again.');
    }
  };

  const handleEdit = exp => {
    setEditingId(exp._id);
    setForm({
      description: exp.description,
      amount: exp.amount,
      category: exp.category
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/${editingId}`, form);
      setEditingId(null);
      setForm({ description: '', amount: '', category: '' });
      fetchExpenses();
      fetchAllExpenses();
      setBudgetRefresh(r => r + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchExpenses();
      fetchAllExpenses();
      setBudgetRefresh(r => r + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Export CSV from current page ---
  const handleExportCSV = () => {
    const dataToExport = expenses.map(({ description, amount, category, createdAt }) => ({
      description,
      amount,
      category,
      date: new Date(createdAt).toLocaleDateString('en-GB')
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'expenses.csv');
  };

  // --- Clear Filters handler ---
  const clearFilters = () => {
    setFilters({ category: 'all', fromDate: '', toDate: '' });
    setSearchText('');
    setPage(1);
    setCategoryInput('All Categories');
  };

  // --- Filter / Search / Sort Handlers ---
  const onFilterChange = newFilters => setFilters(newFilters);
  const onSearchChange = txt => setSearchText(txt);
  const onSortChange = field => {
    const nextOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(nextOrder);
  };

  const formatDateOnly = str => new Date(str).toISOString().split('T')[0];

  // --- CLIENT-SIDE SORT for charts & table ---
  const sortedChartExpenses = useMemo(() => {
    return [...allExpenses].sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [allExpenses, sortBy, sortOrder]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [expenses, sortBy, sortOrder]);

  return (
    <>
      <BudgetTracker
        refreshTrigger={budgetRefresh}
        refreshExpenses={refreshExpenses}
      />

      {/* Expense Form */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                fullWidth
                required
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={6} sm={3}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={6} sm={3} md={3}>
              <Autocomplete
                freeSolo
                fullWidth
                options={categoriesList}
                value={form.category}
                onChange={(e, val) => setForm(f => ({ ...f, category: val || '' }))}
                onInputChange={(e, val) => setForm(f => ({ ...f, category: val }))}
                PopperComponent={props => (
                  <div {...props} style={{ ...props.style, minWidth: 240 }} />
                )}
                ListboxProps={{ sx: { maxHeight: 200, minWidth: 240 } }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Category"
                    fullWidth
                    required
                    InputProps={{ ...params.InputProps, sx: { whiteSpace: 'normal' } }}
                  />
                )}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.date || formatDateOnly(new Date())}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </Grid>

            {/* Submit */}
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

      {/* Filters with Autocomplete for category */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Filters</Typography>
          <Button onClick={clearFilters} size="small">
            Clear Filters
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              fullWidth

              // full list including 'all'
              options={['all', ...categoriesList]}

              // selection state
              value={filters.category}
              onChange={(e, val) => {
                setFilters(f => ({ ...f, category: val || 'all' }));
                setCategoryInput(val === 'all' ? 'All Categories' : val || '');
              }}

              // controlled input text
              inputValue={categoryInput}
              onInputChange={(e, val) => {
                setCategoryInput(val);
                setFilters(f => ({ ...f, category: val }));
              }}

              // clear search text on open
              onOpen={() => setCategoryInput('')}

              // show label
              getOptionLabel={opt => (opt === 'all' ? 'All Categories' : opt)}

              isOptionEqualToValue={(o, v) => o === v}

              PopperComponent={props => (
                <div {...props} style={{ ...props.style, minWidth: 240 }} />
              )}
              ListboxProps={{ sx: { maxHeight: 240, minWidth: 240 } }}

              renderInput={params => (
                <TextField
                  {...params}
                  label="Category"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    sx: { whiteSpace: 'normal' }
                  }}
                />
              )}
            />
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="From Date"
              type="date"
              InputLabelProps={{ shrink:true }}
              value={filters.fromDate}
              onChange={e => onFilterChange({ ...filters, fromDate: e.target.value })}
              sx={{ mr:2 }}
            />
            <TextField
              label="To Date"
              type="date"
              InputLabelProps={{ shrink:true }}
              value={filters.toDate}
              onChange={e => onFilterChange({ ...filters, toDate: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
        />
      </Paper>

      {/* Sort */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          select
          label="Sort By"
          fullWidth
          value={`${sortBy}-${sortOrder}`}
          onChange={e => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          SelectProps={{ native: true }}
        >
          <option value="createdAt-desc">Date: Newest First</option>
          <option value="createdAt-asc">Date: Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </TextField>
      </Paper>

      {/* Charts */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Expense Breakdown by Category</Typography>
        <ExpenseChart expenses={sortedChartExpenses} />
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Total Spent</Typography>
        <Typography variant="h4" color="primary">
          ₹{expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Daily Expense Trend</Typography>
        <ExpenseLineChart expenses={sortedChartExpenses} />
      </Paper>

      {/* Export CSV */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" onClick={handleExportCSV}>
          Export to CSV
        </Button>
      </Box>

      {/* Expense Table & Pagination */}
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
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedExpenses.map(exp => (
              <TableRow key={exp._id}>
                <TableCell>
                  {editingId === exp._id ? (
                    <TextField
                      value={form.description}
                      onChange={e =>
                        setForm({ ...form, description: e.target.value })
                      }
                      fullWidth
                    />
                  ) : (
                    exp.description
                  )}
                </TableCell>
                <TableCell>
                  {editingId === exp._id ? (
                    <TextField
                      type="number"
                      value={form.amount}
                      onChange={e =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      fullWidth
                    />
                  ) : (
                    `₹${exp.amount}`
                  )}
                </TableCell>
                  
                  <TableCell
  sx={{
    transition: 'all 0.1s ease-in-out',
    minWidth: editingId === exp._id ? 400 : 100,
    maxWidth: editingId === exp._id ? 1000 : 100,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  }}
>
  {editingId === exp._id ? (
    <Autocomplete
      freeSolo
      fullWidth
      options={categoriesList}
      value={form.category}
      onChange={(e, val) =>
        setForm(f => ({ ...f, category: val || '' }))
      }
      onInputChange={(e, val) =>
        setForm(f => ({ ...f, category: val }))
      }
      PopperComponent={props => (
        <div {...props} style={{ ...props.style, minWidth: 240 }} />
      )}
      ListboxProps={{ sx: { maxHeight: 200, minWidth: 240 } }}
      renderInput={params => (
        <TextField
          {...params}
          label="Category"
          fullWidth
          InputProps={{
            ...params.InputProps,
            sx: { whiteSpace: 'normal' },
          }}
        />
      )}
    />
  ) : (
    exp.category
  )}
</TableCell>

                
                <TableCell>
                  {editingId === exp._id ? (
                    <TextField
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={
                        form.date ||
                        new Date(exp.createdAt).toISOString().split('T')[0]
                      }
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      fullWidth
                    />
                  ) : (
                    new Date(exp.createdAt)
                      .toLocaleDateString('en-GB')
                      .replace(/\//g, '-')
                  )}
                </TableCell>
                <TableCell>
                  {editingId === exp._id ? (
                    <>
                      <Button onClick={handleSave} size="small">
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => handleEdit(exp)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(exp._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <Button
            variant="outlined"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page <= 1}
            sx={{ mr: 2 }}
          >
            Previous
          </Button>
          <Typography>
            Page {page} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            sx={{ ml: 2 }}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </>
  );
}



