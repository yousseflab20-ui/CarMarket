import API from '../api';

export const registerUser = async (userData: { name: string; email: string; password: string; photo?: string }) => {
    const response = await API.post("auth/register", userData, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    const response = await API.post("auth/login", credentials, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const updateProfile = async (data: { name?: string; phone?: string; city?: string; bio?: string; photo?: string }) => {
    const response = await API.put("auth/update", data);
    return response.data;
};

export const requestResetCode = async (email: string) => {
    const response = await API.post("resetPassword/forgot-password", { email }, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const verifyResetCode = async (data: { email: string; code: string }) => {
    const response = await API.post("resetPassword/verify-code", data, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const resetPassword = async (data: { email: string; newPassword: string }) => {
    const response = await API.post("resetPassword/reset-password", data, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const sendOtp = async (email: string) => {
    const response = await API.post("auth/send-otp", { email }, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

export const verifyOtp = async (data: { email: string; code: string }) => {
    const response = await API.post("auth/verify-otp", data, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};