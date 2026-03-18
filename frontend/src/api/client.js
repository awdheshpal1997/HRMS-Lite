import axios from 'axios';

const normalizeApiBaseUrl = (rawUrl) => {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return 'http://localhost:8000/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.response?.data?.non_field_errors?.[0] ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject({ message, status: error.response?.status, raw: error.response?.data });
  },
);

export default client;