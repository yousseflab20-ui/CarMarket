import API from '../api';
import { useAuthStore } from '../../store/authStore';
import API_URL from '../../constant/URL';
import axios from 'axios';


export const getAllCars = async () => {
    const response = await axios.get(`${API_URL}/car/all`);
    return response.data;
};

export const addCar = async (formData: FormData) => {
    const token = useAuthStore.getState().token;

    const response = await fetch(`${API_URL}/car/add`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return await response.json();
};
