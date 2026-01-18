
import API from '../api';

export const getAllCars = async () => {
    const response = await API.get("/Car/All");
    return response.data;
};

export const addCar = async (formData: FormData) => {
    const response = await API.post("/car/add", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
};
