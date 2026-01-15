import axios from "axios";
import API_URL from "src/constant/URL";
const API = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});
export default API;