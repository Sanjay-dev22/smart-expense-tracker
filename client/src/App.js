import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Button, Box, IconButton, Tooltip
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import axios from 'axios';

import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Profile from './Profile';
import { getTheme } from './theme';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    window.location.href = '/login';
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Smart Expense Tracker</Typography>
            {token && (
              <Box display="flex" alignItems="center">
                <Tooltip title="Toggle light/dark theme">
                  <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
                    {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </Tooltip>
                <Button color="inherit" component={Link} to="/profile" sx={{ mr: 2 }}>
                  Profile
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={token ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={token ? <Profile /> : <Navigate to="/login" replace />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;

