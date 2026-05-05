import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Brightness4OutlinedIcon from '@mui/icons-material/Brightness4Outlined';
import Brightness7OutlinedIcon from '@mui/icons-material/Brightness7Outlined';

const navItems = [
  { label: 'Overview', to: '/', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: 'Profile', to: '/profile', icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
];

export default function AppLayout({ children, onLogout, mode, onToggleTheme }) {
  const location = useLocation();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const [open, setOpen] = useState(false);

  const activeLabel = useMemo(() => {
    return navItems.find((item) => item.to === location.pathname)?.label || 'Overview';
  }, [location.pathname]);

  const sidebar = (
    <Stack sx={{ height: '100%', p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <AccountBalanceWalletOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6">FinSight</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Expense OS
            </Typography>
          </Box>
        </Stack>
        {!isDesktop && (
          <IconButton onClick={() => setOpen(false)} aria-label="Close navigation">
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={0.75}>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              onClick={() => setOpen(false)}
              startIcon={item.icon}
              sx={{
                justifyContent: 'flex-start',
                minHeight: 44,
                px: 1.5,
                color: active ? 'text.primary' : 'text.secondary',
                bgcolor: active ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>

      <Box sx={{ flex: 1 }} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontWeight: 800 }}>S</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            Smart Tracker
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Secured workspace
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {isDesktop && (
        <Box
          component="aside"
          sx={{
            width: 280,
            position: 'fixed',
            inset: '16px auto 16px 16px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          {sidebar}
        </Box>
      )}

      {!isDesktop && open && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(15,23,42,0.42)' }}>
          <Box
            sx={{
              width: 300,
              height: '100%',
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            {sidebar}
          </Box>
        </Box>
      )}

      <Box
        component="main"
        sx={{
          width: '100%',
          ml: { lg: '312px' },
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, lg: 3 },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            position: 'sticky',
            top: 12,
            zIndex: 10,
            mb: 3,
            p: 1,
            pl: { xs: 1, lg: 2 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(21,27,42,0.86)' : 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {!isDesktop && (
              <IconButton onClick={() => setOpen(true)} aria-label="Open navigation">
                <MenuRoundedIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                Workspace
              </Typography>
              <Typography variant="h5">{activeLabel}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Toggle theme">
              <IconButton onClick={onToggleTheme} aria-label="Toggle theme">
                {mode === 'dark' ? <Brightness7OutlinedIcon /> : <Brightness4OutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Log out">
              <IconButton onClick={onLogout} aria-label="Log out">
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        {children}
      </Box>
    </Box>
  );
}
