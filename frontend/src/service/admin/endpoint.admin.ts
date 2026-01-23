import API from '../api';

export const getAllUser = async () => {
    const response = await API.get("admin/all/user")
    console.log("log all user", response.data)
    return response.data.alluser
}

export const removeUser = async (UserId: Number) => {
    const response = await API.delete(`admin/user/${UserId}`)
    console.log("remove user valide", response.data)
    return response.data.alluser
}

export const updateUser = async (id: number) => {
    const response = await API.put(`admin/user/${id}`)
    return response.data
}