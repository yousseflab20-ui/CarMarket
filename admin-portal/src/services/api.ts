import axios from 'axios';

export const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
