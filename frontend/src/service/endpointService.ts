import API_URL from "../constant/URL";
import axios from "axios";
import API from "./api";
import { Alert } from "react-native";

export const AllCar = async () => {
    const res = await axios.get(`${API_URL}/Car/All`);
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
    const response = await API.post(`car/add`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};