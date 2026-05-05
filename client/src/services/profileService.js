import api from './api';

export const getProfile = () => api.get('/profile');

export const updateProfileName = (name) => api.put('/profile/name', { name });

export const updateProfilePassword = (payload) => api.put('/profile/password', payload);
