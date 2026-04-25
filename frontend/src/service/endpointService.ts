import API_URL from "../constant/URL";
import axios from "axios";
import API from "./api";

export const registerUser = async (userData: { name: string; email: string; password: string; photo?: string }) => {
    try {
        const response = await API.post(`auth/register`, userData, {
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
        const response = await API.post(`auth/login`, credentials, {
            headers: { "Content-Type": "application/json" },
        });

        console.log("Login response:", response.data);
        const user = response.data.user ?? response.data.data?.user;
        const token = response.data.token ?? response.data.data?.token;

        if (!user || !token) {
            throw new Error("Login failed: user or token missing");
        }
        return { user, token };
    } catch (error: any) {
        console.error("Login error:", error.response?.data ?? error.message);
        throw new Error(error.response?.data?.message || "Login failed");
    }
};

export const AllCar = async () => {
    const res = await API.get("car/all");
    console.log("backend response:", res.data);
    return res.data;
};

export const addCar = async (formData: FormData) => {
    try {
        const response = await API.post("car/add", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Add car error:", error);
        throw error;
    }
};

export const getUser = async (id: number) => {
    try {
        const response = await API.get(`auth/user/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};