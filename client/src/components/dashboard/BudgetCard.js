import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getBudget, setBudget } from '../../services/budgetService';
import { getExpenseSummary } from '../../services/expenseService';
import { formatCurrency } from '../../utils/formatters';
import Panel from '../ui/Panel';

export default function BudgetCard({ refreshTrigger }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState(0);
  const [spent, setSpent] = useState(0);
  const [newAmount, setNewAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const validYear = /^\d{4}$/.test(year);

  const fetchData = useCallback(async () => {
    if (!validYear) return;
    const parsedYear = parseInt(year, 10);
    setLoading(true);

    try {
      const budgetResponse = await getBudget({ month, year: parsedYear });
      setAmount(Number(budgetResponse.data.budget || 0));
    } catch {
      setAmount(0);
    }

    try {
      const fromDate = `${parsedYear}-${String(month + 1).padStart(2, '0')}-01`;
      const toDate = `${parsedYear}-${String(month + 1).padStart(2, '0')}-31`;
      const expenseResponse = await getExpenseSummary({ fromDate, toDate });
      setSpent(Number(expenseResponse.data.stats?.total || 0));
    } catch {
      setSpent(0);
    } finally {
      setLoading(false);
    }
  }, [month, validYear, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  const remaining = Math.max(amount - spent, 0);
  const status = useMemo(() => {
    if (!amount) return 'Set a monthly budget to unlock pacing.';
    if (percent >= 100) return 'Budget exhausted for this period.';
    if (percent >= 80) return 'Approaching the monthly limit.';
    return 'Spending pace is within range.';
  }, [amount, percent]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validYear) {
      setMessage({ type: 'warning', text: 'Enter a full 4-digit year.' });
      return;
    }

    try {
      await setBudget({ month, year: parseInt(year, 10), amount: newAmount });
      setMessage({ type: 'success', text: 'Budget updated.' });
      setNewAmount('');
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Budget could not be updated.' });
    }
  };

  return (
    <Panel title="Monthly Budget" eyebrow="Budget">
      <Stack spacing={2.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField select label="Month" value={month} onChange={(event) => setMonth(Number(event.target.value))} sx={{ minWidth: 160 }}>
            {Array.from({ length: 12 }, (_, index) => (
              <MenuItem key={index} value={index}>
                {new Date(0, index).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Year" type="number" value={year} onChange={(event) => setYear(event.target.value)} />
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
            <Typography variant="h3">{formatCurrency(spent)}</Typography>
            <Typography variant="body2" color="text.secondary">
              of {formatCurrency(amount)}
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={percent} color={percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'primary'} />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {status}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {loading ? 'Syncing' : `${Math.round(percent)}%`}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
          <Typography variant="body2" color="text.secondary">
            Remaining
          </Typography>
          <Typography variant="h4">{formatCurrency(remaining)}</Typography>
        </Box>

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        <Stack component="form" onSubmit={handleSubmit} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label="New budget"
            type="number"
            value={newAmount}
            onChange={(event) => setNewAmount(event.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" sx={{ minWidth: 128 }}>
            Set
          </Button>
        </Stack>
      </Stack>
    </Panel>
  );
}
