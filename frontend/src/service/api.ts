import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { catchError } from "../utils/errorHandler";
import API_URL from "../constant/URL";

const baseURL = `${API_URL}/api/`;
const API = axios.create({
    baseURL: baseURL,
    timeout: 30000,
});

API.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Pass the language preference to the backend
        try {
            const lang = require('../i18n').default.language;
            if (lang) {
                config.params = { ...config.params, lang };
            }
        } catch (e) {
            // i18n might not be loaded yet
        }

        return config;
    },
    (error: any) => Promise.reject(catchError(error))
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { isAuthenticated, logout } = useAuthStore.getState();
            if (isAuthenticated) {
                console.log("🔒 Session expired or unauthorized, logging out...");
                logout();
            }
        }
        return Promise.reject(error);
    }
);

export default API;