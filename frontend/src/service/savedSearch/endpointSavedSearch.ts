import API from "../api";

export type CreateSavedSearchPayload = {
    pushToken?: string | null;
    brand?: string;
    model?: string;
    minPrice?: string;
    maxPrice?: string;
    city?: string;
    year?: string;
    transmission?: string;
    search?: string;
    fuelType?: string;
};

export const createSavedSearch = async (payload: CreateSavedSearchPayload) => {
    const response = await API.post("savedsearch", payload);
    return response.data;
};