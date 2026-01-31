import API from '../api';
import { useAuthStore } from '../../stores/authStore';
import API_URL from '../../constant/URL';
import axios from 'axios';

const baseURL = "http://10.0.2.2:5000/api";

export const getAllCars = async () => {
    const response = await axios.get(`${API_URL}/car/all`);
    return response.data;
};

export const addCar = async (carData: any) => {
    try {
        const token = useAuthStore.getState().token;
        console.log("token", token);

        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(carData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        return await response.json();
    } catch (error) {
        console.error("Add car error:", error);
        throw error;
    }
};
