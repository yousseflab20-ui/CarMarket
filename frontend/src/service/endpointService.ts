import API_URL from "../constant/URL";
import axios from "axios";

export const registerUser = async (userData: { name: string; email: string; password: string; photo?: string }) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("hadi hya data", response.data);
        return response.data;
    } catch (error: any) {
        console.log("hada hoa error", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Server error");
    }
};
export const loginUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error("user undifind");
    }
};

export const AllCar = async () => {
    const res = await axios.get(`${API_URL}/Car/All`);
    console.log("backend response:", res.data);
    return res.data;
};