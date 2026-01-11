import axios from "axios";
import Config from "react-native-config";
console.log("API_URL =", process.env.API_URL);
const API = axios.create({
    baseURL: Config.API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});
console.log("API_URL =", process.env.API_URL);
export default API;