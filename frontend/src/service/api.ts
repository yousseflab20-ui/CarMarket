import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { Platform } from "react-native";
const baseURL = Platform.OS === "ios" ? "http://localhost:5000/api" : "http://10.0.2.2:5000/api";
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
    (error) => Promise.reject(error)
);

export default API;
