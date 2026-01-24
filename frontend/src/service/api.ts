import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { Platform } from "react-native";
import { catchError } from "../utils/errorHandler";

const baseURL = "http://10.0.2.2:5000/api";
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
        if (error.response && error.response.status === 401) {
            console.log("🔒 Session expired or unauthorized, logging out...");
            useAuthStore.getState().logout();
        }

        const parsedError = catchError(error);
        return Promise.reject(parsedError);
    }
);

export default API;
