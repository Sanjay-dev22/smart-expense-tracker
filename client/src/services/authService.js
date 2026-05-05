import api from './api';

export const login = (credentials) => api.post('/auth/login', credentials);

export const register = (payload) => api.post('/auth/register', payload);

export const googleLogin = (idToken) => api.post('/auth/google', { idToken });

export const resendVerification = (email) => api.post('/auth/resend-verification', { email });

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = ({ token, password }) =>
  api.post('/auth/reset-password', { token, password });
