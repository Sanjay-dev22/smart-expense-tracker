import api from './api';

export const getExpenses = (params, config = {}) => api.get('/expenses', { params, ...config });

export const getExpenseSummary = (params, config = {}) => api.get('/expenses/summary', { params, ...config });

export const createExpense = (payload) => api.post('/expenses', payload);

export const updateExpense = (id, payload) => api.put(`/expenses/${id}`, payload);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
