
import API from '../api';
import { useAuthStore } from '../../stores/authStore';
import { Platform } from 'react-native';

const baseURL = Platform.OS === "ios" ? "http://localhost:5000/api" : "http://10.0.2.2:5000/api";

export const getAllCars = async () => {
    const response = await API.get("/Car/All");
    return response.data;
};

// Add car with JSON payload
export const addCar = async (data: any) => {
    const response = await API.post("/car/add", data);
    return response.data;
};
