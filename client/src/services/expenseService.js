import api from './api';

export const getExpenses = (params) => api.get('/expenses', { params });

export const createExpense = (payload) => api.post('/expenses', payload);

export const updateExpense = (id, payload) => api.put(`/expenses/${id}`, payload);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
