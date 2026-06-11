import axios from 'axios';

const resolvedBase = (typeof window !== 'undefined')
    ? (import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`)
    : (import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
    baseURL: resolvedBase
});

// Add a request interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
