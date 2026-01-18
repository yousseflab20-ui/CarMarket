import API from '../api';

export const getFavorites = async () => {
    const response = await API.get("/favorite/favorite");
    return response.data;
};

export const addFavorite = async (carId: number) => {
    const response = await API.post(`favorite/favorite/${carId}`);
    return response.data;
};

export const removeFavorite = async (carId: number) => {
    const response = await API.delete(`favorite/favorite/${carId}`);
    return response.data;
};