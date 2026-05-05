import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Grid, Stack, Typography } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import BudgetCard from '../components/dashboard/BudgetCard';
import ExpenseCategoryChart from '../components/dashboard/ExpenseCategoryChart';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import MetricCard from '../components/ui/MetricCard';
import Panel from '../components/ui/Panel';
import LoadingState from '../components/ui/LoadingState';
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../services/expenseService';
import { commonCategories, getExpenseStats, mergeCategories, sortExpenses } from '../utils/expenseUtils';
import { formatCurrency, toInputDate } from '../utils/formatters';

const emptyForm = {
  description: '',
  amount: '',
  category: '',
  date: toInputDate(),
};

export default function DashboardPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ category: 'all', fromDate: '', toDate: '' });
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [categories, setCategories] = useState(commonCategories);
  const [budgetRefresh, setBudgetRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 10;

  const fetchExpenses = useCallback(async () => {
    setError('');
    try {
      const params = {
        page,
        limit,
        ...(filters.category !== 'all' && { category: filters.category }),
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        search: searchText,
      };
      const response = await getExpenses(params);
      const payload = response.data || {};
      const nextExpenses = payload.expenses || [];
      const nextTotalPages = payload.totalPages || 1;
      setExpenses(nextExpenses);
      setTotalPages(nextTotalPages);
      setPage(Math.min(payload.page || page, nextTotalPages));
      setCategories((current) => mergeCategories(nextExpenses, current));
    } catch {
      setExpenses([]);
      setTotalPages(1);
      setError('Expenses could not be loaded. Refresh or sign in again.');
    }
  }, [filters, page, searchText]);

  const fetchAllExpenses = useCallback(async () => {
    try {
      const response = await getExpenses({
        page: 1,
        limit: 1000000,
        ...(filters.category !== 'all' && { category: filters.category }),
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        search: searchText,
      });
      const nextExpenses = response.data.expenses || [];
      setAllExpenses(nextExpenses);
      setCategories((current) => mergeCategories(nextExpenses, current));
    } catch {
      setAllExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchText]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    setPage(1);
    fetchAllExpenses();
  }, [fetchAllExpenses]);

  const sortedExpenses = useMemo(() => sortExpenses(expenses, sortBy, sortOrder), [expenses, sortBy, sortOrder]);
  const sortedChartExpenses = useMemo(() => sortExpenses(allExpenses, sortBy, sortOrder), [allExpenses, sortBy, sortOrder]);
  const stats = useMemo(() => getExpenseStats(allExpenses), [allExpenses]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const refreshAll = () => {
    fetchExpenses();
    fetchAllExpenses();
    setBudgetRefresh((current) => current + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createExpense(form);
      resetForm();
      refreshAll();
    } catch {
      setError('Expense could not be saved.');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setForm({
      description: expense.description || '',
      amount: expense.amount || '',
      category: expense.category || '',
      date: toInputDate(expense.createdAt || expense.date),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateExpense(editingId, form);
      resetForm();
      refreshAll();
    } catch {
      setError('Expense update failed.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      refreshAll();
    } catch {
      setError('Expense could not be deleted.');
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      sortedExpenses.map(({ description, amount, category, createdAt, date }) => ({
        description,
        amount,
        category,
        date: toInputDate(createdAt || date),
      }))
    );
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'expenses.csv');
  };

  const clearFilters = () => {
    setFilters({ category: 'all', fromDate: '', toDate: '' });
    setSearchText('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  if (loading) return <LoadingState label="Preparing your financial workspace" />;

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h2">Financial command center</Typography>
        <Typography variant="body1" color="text.secondary">
          Track spend, control budgets, and spot category pressure before it compounds.
        </Typography>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Total tracked"
            value={formatCurrency(stats.total)}
            helper={`${stats.count} transactions in scope`}
            icon={<AccountBalanceWalletOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="This month"
            value={formatCurrency(stats.monthly)}
            helper="Current calendar month"
            icon={<TrendingUpOutlinedIcon />}
            tone="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Top category"
            value={stats.topCategory}
            helper={formatCurrency(stats.topCategoryAmount)}
            icon={<CategoryOutlinedIcon />}
            tone="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Average spend"
            value={formatCurrency(stats.average)}
            helper={`${stats.categoryCount} active categories`}
            icon={<ReceiptLongOutlinedIcon />}
            tone="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} xl={7}>
          <ExpenseForm
            form={form}
            setForm={setForm}
            categories={categories}
            onSubmit={handleSubmit}
            editing={Boolean(editingId)}
            onSave={handleSave}
            onCancel={resetForm}
          />
        </Grid>
        <Grid item xs={12} xl={5}>
          <BudgetCard refreshTrigger={budgetRefresh} refreshExpenses={fetchExpenses} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} xl={7}>
          <Panel title="Spend Trend" eyebrow="Daily movement">
            <ExpenseTrendChart expenses={sortedChartExpenses} />
          </Panel>
        </Grid>
        <Grid item xs={12} xl={5}>
          <Panel title="Category Mix" eyebrow="Allocation">
            <ExpenseCategoryChart expenses={sortedChartExpenses} />
          </Panel>
        </Grid>
      </Grid>

      <ExpenseFilters
        categories={categories}
        filters={filters}
        setFilters={setFilters}
        searchText={searchText}
        setSearchText={setSearchText}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        onClear={clearFilters}
      />

      <ExpenseList
        expenses={sortedExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExportCSV}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </Stack>
  );
}
