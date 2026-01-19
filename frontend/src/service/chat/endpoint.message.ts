import API from "../api";

const message = async () => {
    const response = await API.post(`chat/conversation`)
    return response.data
}
