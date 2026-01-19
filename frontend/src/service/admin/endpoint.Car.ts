import API from '../api';

export const getAllCar = async () => {
    const response = await API.get("admin/AllCar")
    return response.data.Carall
}

export const removeCar = async (CarId: number) => {
    const response = await API.delete(`admin/all/${CarId}`)
    console.log("remove Car", response.data)
    return response.data
}