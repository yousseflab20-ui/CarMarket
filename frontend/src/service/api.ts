import axios from "axios";
import { useAuthStore } from "../store/authStore";

import API_URL from "../constant/URL";

const API = axios.create({
    baseURL: API_URL,
    timeout: 30000,
});

API.interceptors.request.use(
    async (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;
