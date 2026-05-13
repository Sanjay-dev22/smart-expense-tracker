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
import Toast from '../components/ui/Toast';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useToast from '../hooks/useToast';
import { createExpense, deleteExpense, getExpenses, getExpenseSummary, updateExpense } from '../services/expenseService';
import { commonCategories } from '../utils/expenseUtils';
import { formatCurrency, toInputDate } from '../utils/formatters';

const emptyForm = {
  description: '',
  amount: '',
  category: '',
  date: toInputDate(),
};

const emptySummary = {
  stats: {
    total: 0,
    monthly: 0,
    average: 0,
    count: 0,
    topCategory: 'None',
    topCategoryAmount: 0,
    categoryCount: 0,
  },
  categories: [],
  daily: [],
  categoryNames: [],
};

function requestCanceled(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
}

function expenseMatchesFilters(expense, filters, search) {
  if (filters.category !== 'all' && expense.category !== filters.category) return false;

  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch && !String(expense.description || '').toLowerCase().includes(normalizedSearch)) {
    return false;
  }

  const createdAt = new Date(expense.createdAt || expense.date);
  if (filters.fromDate) {
    const start = new Date(filters.fromDate);
    start.setHours(0, 0, 0, 0);
    if (createdAt < start) return false;
  }
  if (filters.toDate) {
    const end = new Date(filters.toDate);
    end.setHours(23, 59, 59, 999);
    if (createdAt > end) return false;
  }

  return true;
}

export default function DashboardPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ category: 'all', fromDate: '', toDate: '' });
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, 250);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [budgetRefresh, setBudgetRefresh] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast, showToast, closeToast } = useToast();
  const limit = 10;

  const pageParams = useMemo(() => ({
    page,
    limit,
    sortBy,
    sortOrder,
    ...(filters.category !== 'all' && { category: filters.category }),
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    search: debouncedSearch,
  }), [debouncedSearch, filters.category, filters.fromDate, filters.toDate, page, sortBy, sortOrder]);

  const summaryParams = useMemo(() => ({
    ...(filters.category !== 'all' && { category: filters.category }),
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    search: debouncedSearch,
  }), [debouncedSearch, filters.category, filters.fromDate, filters.toDate]);

  const categories = useMemo(
    () => Array.from(new Set([...commonCategories, ...(summary.categoryNames || [])])),
    [summary.categoryNames]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category, filters.fromDate, filters.toDate, sortBy, sortOrder]);

  useEffect(() => {
    const controller = new AbortController();
    setPageLoading(true);
    setError('');

    getExpenses(pageParams, { signal: controller.signal })
      .then((response) => {
        const payload = response.data || {};
        const nextTotalPages = payload.totalPages || 1;
        setExpenses(payload.expenses || []);
        setTotalPages(nextTotalPages);
        setPage((current) => Math.min(payload.page || current, nextTotalPages));
      })
      .catch((apiError) => {
        if (requestCanceled(apiError)) return;
        setExpenses([]);
        setTotalPages(1);
        setError('Expenses could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setPageLoading(false);
      });

    return () => controller.abort();
  }, [pageParams, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setSummaryLoading(true);

    getExpenseSummary(summaryParams, { signal: controller.signal })
      .then((response) => {
        setSummary({
          ...emptySummary,
          ...response.data,
          stats: { ...emptySummary.stats, ...(response.data.stats || {}) },
        });
      })
      .catch((apiError) => {
        if (!requestCanceled(apiError)) {
          setSummary(emptySummary);
          setError('Summary could not be loaded.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSummaryLoading(false);
      });

    return () => controller.abort();
  }, [summaryParams, refreshKey]);

  const resetForm = useCallback(() => {
    setForm({ ...emptyForm, date: toInputDate() });
    setEditingId(null);
  }, []);

  const refreshLightweightData = useCallback(() => {
    setRefreshKey((current) => current + 1);
    setBudgetRefresh((current) => current + 1);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await createExpense(form);
      const savedExpense = response.data;
      resetForm();

      if (page === 1 && expenseMatchesFilters(savedExpense, filters, debouncedSearch)) {
        setExpenses((current) => [savedExpense, ...current].slice(0, limit));
      }

      refreshLightweightData();
      showToast('Expense added.');
    } catch {
      showToast('Expense could not be saved.', 'error');
    } finally {
      setSaving(false);
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
    setSaving(true);
    try {
      const response = await updateExpense(editingId, form);
      const updatedExpense = response.data;
      setExpenses((current) =>
        current
          .map((expense) => (expense._id === editingId ? updatedExpense : expense))
          .filter((expense) => expenseMatchesFilters(expense, filters, debouncedSearch))
      );
      resetForm();
      refreshLightweightData();
      showToast('Expense updated.');
    } catch {
      showToast('Expense update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const previousExpenses = expenses;
    setExpenses((current) => current.filter((expense) => expense._id !== id));

    try {
      await deleteExpense(id);
      if (previousExpenses.length === 1 && page > 1) setPage((current) => current - 1);
      refreshLightweightData();
      showToast('Expense deleted.');
    } catch {
      setExpenses(previousExpenses);
      showToast('Expense could not be deleted.', 'error');
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      expenses.map(({ description, amount, category, createdAt, date }) => ({
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

  const loading = pageLoading && summaryLoading && !expenses.length && !summary.stats.count;
  if (loading) return <LoadingState label="Loading your expenses" />;

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h2">Overview</Typography>
        <Typography variant="body1" color="text.secondary">
          A clear view of spending, budgets, and recent activity.
        </Typography>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Total spent"
            value={formatCurrency(summary.stats.total)}
            helper={`${summary.stats.count} expenses`}
            icon={<AccountBalanceWalletOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="This month"
            value={formatCurrency(summary.stats.monthly)}
            helper="Current month"
            icon={<TrendingUpOutlinedIcon />}
            tone="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Largest category"
            value={summary.stats.topCategory}
            helper={formatCurrency(summary.stats.topCategoryAmount)}
            icon={<CategoryOutlinedIcon />}
            tone="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Average"
            value={formatCurrency(summary.stats.average)}
            helper={`${summary.stats.categoryCount} categories`}
            icon={<ReceiptLongOutlinedIcon />}
            tone="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} xl={7}>
          <ExpenseForm
            form={form}
            setForm={setForm}
            categories={categories}
            onSubmit={handleSubmit}
            editing={Boolean(editingId)}
            onSave={handleSave}
            onCancel={resetForm}
            saving={saving}
          />
        </Grid>
        <Grid item xs={12} xl={5}>
          <BudgetCard refreshTrigger={budgetRefresh} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} xl={7}>
          <Panel title="Spending Trend" eyebrow="Trend">
            <ExpenseTrendChart data={summary.daily} />
          </Panel>
        </Grid>
        <Grid item xs={12} xl={5}>
          <Panel title="Categories" eyebrow="Breakdown">
            <ExpenseCategoryChart data={summary.categories} />
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
        expenses={expenses}
        loading={pageLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExportCSV}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      <Toast toast={toast} onClose={closeToast} />
    </Stack>
  );
}
