import axios from 'axios';

const defaultBackendBase = 'https://volunteer-management-system-1-z87l.onrender.com/api';
const envBase = import.meta.env.VITE_API_BASE_URL;
const isLocalHost = typeof window !== 'undefined' && /(^localhost$|^127\.|^0\.0\.0\.0|\.local$)/i.test(window.location.hostname);
const resolvedBase = typeof window !== 'undefined'
    ? (envBase || (isLocalHost ? `${window.location.origin}/api` : defaultBackendBase))
    : (envBase || '/api');

const normalizedBase = resolvedBase.replace(/\/+$/, '') + '/';
const api = axios.create({
    baseURL: normalizedBase
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
