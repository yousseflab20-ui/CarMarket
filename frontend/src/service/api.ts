import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API = axios.create({
    baseURL: "http://10.0.2.2:5000/api",
    timeout: 30000,
    // headers: {
    //     "Content-Type": "multipart/form-data",
    // },
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
