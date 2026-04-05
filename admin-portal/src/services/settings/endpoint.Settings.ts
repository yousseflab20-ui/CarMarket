import api from '../../services/api';

export const getFAQ = async () => {
    const response = await api.get("/settings/getfaq")
    return response.data
}

export const getAllFAQs = async () => {
    const response = await api.get("/settings/getfaq")
    return response.data
}

export const createFAQ = async (data: { question: string; answer: string }) => {
    const response = await api.post("/settings/postfaq", data)
    return response.data
}

export const updateFAQ = async (id: number, data: { question: string; answer: string; isActive?: boolean }) => {
    const response = await api.put(`/settings/Updatefaq/${id}`, data)
    return response.data
}

export const deleteFAQ = async (id: number) => {
    const response = await api.delete(`/settings/deletefaq/${id}`)
    return response.data
}