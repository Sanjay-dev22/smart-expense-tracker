import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

export default function CategoryAutocomplete({
  label = 'Category',
  value,
  onChange,
  options,
  required = false,
  freeSolo = false,
  disabled = false,
}) {
  return (
    <Autocomplete
      freeSolo={freeSolo}
      disabled={disabled}
      fullWidth
      options={options}
      value={value || null}
      getOptionLabel={(option) => (option === 'all' ? 'All categories' : option || '')}
      onChange={(_, nextValue) => onChange(nextValue || '')}
      onInputChange={(_, nextValue, reason) => {
        if (freeSolo && reason === 'input') onChange(nextValue || '');
      }}
      isOptionEqualToValue={(option, selected) => option === selected}
      ListboxProps={{
        sx: {
          py: 0.5,
          '& .MuiAutocomplete-option': {
            minHeight: 40,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            alignItems: 'flex-start',
            lineHeight: 1.35,
          },
        },
      }}
      slotProps={{
        paper: {
          sx: {
            minWidth: { xs: 260, sm: 340 },
            borderRadius: 2,
            boxShadow: '0 18px 48px rgba(16, 24, 40, 0.16)',
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          inputProps={{
            ...params.inputProps,
            'aria-label': label,
          }}
        />
      )}
    />
  );
}
