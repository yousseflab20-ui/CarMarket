import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { Platform } from "react-native";
import { catchError } from "../utils/errorHandler";

const baseURL = Platform.OS === "ios" ? "http://localhost:5000/api" : "http://10.0.2.2:5000/api";
const API = axios.create({
    baseURL: baseURL,
    timeout: 30000,
});

// Request interceptor - adds auth token
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

// Response interceptor - catches and parses errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for 401 Unauthorized (Stale token / Invalid token)
        if (error.response && error.response.status === 401) {
            console.log("🔒 Session expired or unauthorized, logging out...");
            // Auto logout
            useAuthStore.getState().logout();
        }

        const parsedError = catchError(error);
        return Promise.reject(parsedError);
    }
);

export default API;
