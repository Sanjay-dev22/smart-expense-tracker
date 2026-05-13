import React from 'react';
import { Button, Grid, MenuItem, TextField } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Panel from '../ui/Panel';
import CategoryAutocomplete from './CategoryAutocomplete';

export default function ExpenseFilters({
  categories,
  filters,
  setFilters,
  searchText,
  setSearchText,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  onClear,
}) {
  return (
    <Panel
      title="Filters"
      eyebrow="View"
      action={
        <Button variant="outlined" size="small" startIcon={<RestartAltRoundedIcon />} onClick={onClear}>
          Reset
        </Button>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            label="Search transactions"
            fullWidth
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" /> }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CategoryAutocomplete
            options={['all', ...categories]}
            value={filters.category}
            label="Category"
            onChange={(value) => setFilters((current) => ({ ...current, category: value || 'all' }))}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="From"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.fromDate}
            onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="To"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.toDate}
            onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Sort"
            fullWidth
            value={`${sortBy}-${sortOrder}`}
            onChange={(event) => {
              const [field, order] = event.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <MenuItem value="createdAt-desc">Newest</MenuItem>
            <MenuItem value="createdAt-asc">Oldest</MenuItem>
            <MenuItem value="amount-desc">High</MenuItem>
            <MenuItem value="amount-asc">Low</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Panel>
  );
}
