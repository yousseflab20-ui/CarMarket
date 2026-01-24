
import API from '../api';

export const registerUser = async (userData: { name: string; email: string; password: string; photo?: string }) => {
    const response = await API.post("/auth/register", userData, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    const response = await API.post("/auth/login", credentials, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};
