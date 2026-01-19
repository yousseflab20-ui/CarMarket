import API from '../api';

export const getAllUser = async () => {
    const response = await API.get("admin/all/user")
    console.log("log all user", response.data)
    return response.data.alluser
}
