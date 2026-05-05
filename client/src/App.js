import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { setAuthToken } from './services/api';
import { getTheme } from './theme';

function ProtectedShell({ token, mode, onToggleTheme, onLogout, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return (
    <AppLayout mode={mode} onToggleTheme={onToggleTheme} onLogout={onLogout}>
      {children}
    </AppLayout>
  );
}

function AppRoutes({ token, setToken, mode, toggleTheme }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setAuthToken('');
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage setToken={setToken} />} />
      <Route path="/register" element={token ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedShell token={token} mode={mode} onToggleTheme={toggleTheme} onLogout={handleLogout}>
            <DashboardPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedShell token={token} mode={mode} onToggleTheme={toggleTheme} onLogout={handleLogout}>
            <ProfilePage />
          </ProtectedShell>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const toggleTheme = () => {
    setMode((current) => {
      const nextMode = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextMode);
      return nextMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes token={token} setToken={setToken} mode={mode} toggleTheme={toggleTheme} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
