import API_URL from "../constant/URL";
import axios from "axios";
import API from "./api";
import { getToken } from "../service/StorageToken";
import { Alert } from "react-native";

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
        const response = await axios.post(`${API_URL}auth/login`, credentials, {
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
    const res = await axios.get(`${API_URL}Car/All`);
    console.log("backend response:", res.data);
    return res.data;
};

export const createOrder = async (carId: number, message: string) => {
    try {
        const response = await API.post("orders/create", {
            carId,
            message,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getSellerOrders = async () => {
    const response = await API.get("orders/seller");
    return response.data;
};

export const getBuyerOrders = async () => {
    const response = await API.get("orders/buyer");
    return response.data;
};

export const acceptOrder = async (id: number) => {
    const response = await API.put(`orders/${id}/accept`);
    return response.data;
};

export const rejectOrder = async (id: number) => {
    const response = await API.put(`orders/${id}/reject`);
    return response.data;
};


export const addCar = async (formData: FormData) => {
    try {
        const res = await API.post("/car/Car", formData, {
            transformRequest: (data, headers) => {
                delete headers['Content-Type'];
                return data;
            },
            timeout: 30000,
        });

        console.log("✅ Car added:", res.data);
        return res.data;
    } catch (err: any) {
        console.log("Error adding car:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Failed to add car");
    }
};
