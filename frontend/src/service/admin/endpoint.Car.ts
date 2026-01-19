import API from '../api';

export const getAllCar = async () => {
    const response = await API.get("car/All")
    console.log("hahoma li car", response.data)
    return response.data
}