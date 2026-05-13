import React from 'react';
import { Button, Grid, Stack, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { toInputDate } from '../../utils/formatters';
import Panel from '../ui/Panel';
import CategoryAutocomplete from './CategoryAutocomplete';

export default function ExpenseForm({
  form,
  setForm,
  categories,
  onSubmit,
  editing,
  onSave,
  onCancel,
  saving = false,
}) {
  return (
    <Panel title={editing ? 'Edit Expense' : 'Add Expense'} eyebrow="Expense">
      <Stack component="form" onSubmit={editing ? (event) => event.preventDefault() : onSubmit} spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Description"
              fullWidth
              required
              disabled={saving}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              required
              disabled={saving}
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CategoryAutocomplete
              freeSolo
              value={form.category || ''}
              options={categories}
              required
              disabled={saving}
              onChange={(value) => setForm((current) => ({ ...current, category: value }))}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              disabled={saving}
              InputLabelProps={{ shrink: true }}
              value={form.date || toInputDate()}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
          {editing ? (
            <>
              <Button variant="outlined" startIcon={<CloseRoundedIcon />} onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave} disabled={saving}>
                {saving ? 'Saving' : 'Save'}
              </Button>
            </>
          ) : (
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={saving}>
              {saving ? 'Saving' : 'Add Expense'}
            </Button>
          )}
        </Stack>
      </Stack>
    </Panel>
  );
}
