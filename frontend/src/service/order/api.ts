
import API from '../api';

export const createOrder = async (carId: number, message: string) => {
    const response = await API.post("/orders/create", {
        carId,
        message,
    });
    return response.data;
};

export const getSellerOrders = async () => {
    const response = await API.get("/orders/seller");
    return response.data;
};

export const getBuyerOrders = async () => {
    const response = await API.get("/orders/buyer");
    return response.data;
};

export const acceptOrder = async (id: number) => {
    const response = await API.put(`/orders/${id}/accept`);
    return response.data;
};

export const rejectOrder = async (id: number) => {
    const response = await API.put(`/orders/${id}/reject`);
    return response.data;
};
