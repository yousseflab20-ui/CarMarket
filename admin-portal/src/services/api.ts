import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
axios.interceptors.request.use(req => {
  console.log("➡️ API CALL:", req.url);
  return req;
});

axios.interceptors.response.use(res => {
  console.log("⬅️ RESPONSE:", res.status);
  return res;
});
export default api;
