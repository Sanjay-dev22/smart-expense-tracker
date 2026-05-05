import React from 'react';
import { Autocomplete, Button, Grid, Stack, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { toInputDate } from '../../utils/formatters';
import Panel from '../ui/Panel';

export default function ExpenseForm({
  form,
  setForm,
  categories,
  onSubmit,
  editing,
  onSave,
  onCancel,
}) {
  return (
    <Panel title={editing ? 'Edit Expense' : 'Add Expense'} eyebrow="Transaction capture">
      <Stack component="form" onSubmit={editing ? (event) => event.preventDefault() : onSubmit} spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              label="Description"
              fullWidth
              required
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
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              fullWidth
              options={categories}
              value={form.category || ''}
              onChange={(_, value) => setForm((current) => ({ ...current, category: value || '' }))}
              onInputChange={(_, value) => setForm((current) => ({ ...current, category: value || '' }))}
              renderInput={(params) => <TextField {...params} label="Category" required />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={form.date || toInputDate()}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
          {editing ? (
            <>
              <Button variant="outlined" startIcon={<CloseRoundedIcon />} onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave}>
                Save
              </Button>
            </>
          ) : (
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />}>
              Add Expense
            </Button>
          )}
        </Stack>
      </Stack>
    </Panel>
  );
}
