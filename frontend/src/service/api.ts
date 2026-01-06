import axios from "axios";
import Config from "react-native-config";
import { getToken } from "./storageToken";
const API = axios.create({
    baseURL: Config.API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    (error) => Promise.reject(error)
)
export default API