import API_URL from "../constant/URL";
import axios from "axios";
import API from "./api";

export const AllCar = async () => {
    const res = await axios.get(`${API_URL}Car/All`);
    console.log("backend response:", res.data);
    return res.data;
};

export const addCar = async (formData: FormData) => {
    try {
        console.log("🚀 Starting addCar request...");
        console.log("📍 API URL:", API_URL);
        console.log("🔄 Sending request to:", `${API_URL}car/add`);

        const res = await API.post("car/add", formData, {
            timeout: 30000,
        });

        console.log("✅ Car added:", res.data);
        return res.data;
    } catch (err: any) {
        console.log("❌ Error adding car details:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers,
            config: {
                url: err.config?.url,
                baseURL: err.config?.baseURL,
                method: err.config?.method,
            }
        });
        throw new Error(err.response?.data?.message || err.message || "Failed to add car");
    }
};