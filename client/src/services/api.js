import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 12000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const method = String(config.method || 'get').toLowerCase();
    const canRetry = method === 'get' && !config.__retried;
    const status = error.response?.status;

    if (canRetry && (!status || status >= 500)) {
      config.__retried = true;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common.Authorization;
  }
};

export default api;
