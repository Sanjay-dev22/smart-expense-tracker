import React from 'react';
import { Box, Button, Chip, IconButton, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { formatCurrency, formatDate } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';
import Panel from '../ui/Panel';

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onExport,
  page,
  totalPages,
  setPage,
}) {
  return (
    <Panel
      title="Expenses"
      eyebrow="Ledger"
      action={
        <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={onExport} disabled={!expenses.length}>
          Export CSV
        </Button>
      }
    >
      {!expenses.length ? (
        <EmptyState
          title="No expenses found"
          description="Add a transaction or adjust filters to populate the ledger."
        />
      ) : (
        <Stack spacing={1.25}>
          {expenses.map((expense) => (
            <Box
              key={expense._id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr auto', md: 'minmax(220px, 1fr) 150px 140px 120px auto' },
                gap: { xs: 1, md: 2 },
                alignItems: 'center',
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                transition: 'background-color 180ms ease, border-color 180ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 800 }} noWrap>
                  {expense.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(expense.createdAt || expense.date)}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 900, textAlign: { md: 'right' } }}>
                {formatCurrency(expense.amount)}
              </Typography>
              <Chip label={expense.category || 'Uncategorized'} size="small" sx={{ justifySelf: { md: 'start' }, maxWidth: 140 }} />
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                Recorded
              </Typography>
              <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ gridColumn: { xs: '2', md: 'auto' } }}>
                <IconButton aria-label="Edit expense" onClick={() => onEdit(expense)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label="Delete expense" color="error" onClick={() => onDelete(expense._id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeRoundedIcon />}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
          Page {page} of {Math.max(totalPages, 1)}
        </Typography>
        <Button
          variant="outlined"
          endIcon={<NavigateNextRoundedIcon />}
          onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </Stack>
    </Panel>
  );
}
