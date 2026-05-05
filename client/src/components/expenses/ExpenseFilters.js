import React from 'react';
import { Autocomplete, Button, Grid, MenuItem, TextField } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Panel from '../ui/Panel';

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
      eyebrow="Refine"
      action={
        <Button variant="outlined" size="small" startIcon={<RestartAltRoundedIcon />} onClick={onClear}>
          Reset
        </Button>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Search transactions"
            fullWidth
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" /> }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            freeSolo
            fullWidth
            options={['all', ...categories]}
            value={filters.category}
            onChange={(_, value) => setFilters((current) => ({ ...current, category: value || 'all' }))}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') setFilters((current) => ({ ...current, category: value || 'all' }));
            }}
            getOptionLabel={(option) => (option === 'all' ? 'All categories' : option)}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="From"
            type="date"
            fullWidth
            value={filters.fromDate}
            onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="To"
            type="date"
            fullWidth
            value={filters.toDate}
            onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={1}>
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
