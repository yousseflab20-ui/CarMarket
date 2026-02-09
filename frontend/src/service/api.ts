import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { catchError } from "../utils/errorHandler";

const baseURL = "http://192.168.1.200:5000/api";
const API = axios.create({
    baseURL: baseURL,
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
    (error) => Promise.reject(catchError(error))
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log("🔒 Session expired or unauthorized, logging out...");
            useAuthStore.getState().logout();
        }
        return Promise.reject(error); // Pass error to query for handling
    }
);

export default API;