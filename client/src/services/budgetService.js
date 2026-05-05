import api from './api';

export const getBudget = (params) => api.get('/budget', { params });

export const setBudget = (payload) => api.post('/budget', payload);
