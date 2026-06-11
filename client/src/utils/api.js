import axios from 'axios';

const defaultBackendBase = 'https://volunteer-management-system-1-z87l.onrender.com/api';
const resolvedBase = (typeof window !== 'undefined')
    ? (import.meta.env.VITE_API_BASE_URL || (window.location.hostname.includes('vercel.app') ? defaultBackendBase : `${window.location.origin}/api`))
    : (import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
    baseURL: resolvedBase
});

// Normalize request URLs so baseURL is always applied.
api.interceptors.request.use(config => {
    if (config.url) {
        config.url = config.url.replace(/^\/+/, '');
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
