import API from "../api";

export const message = async (user2Id: number) => {
    try {
        const response = await API.post(`chat/conversation/${user2Id}`);
        console.log("Open conversation:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error opening conversation:", error);
        throw error;
    }
};

export const createConvirsastion = async (data: { conversationId: number; content: string }) => {
    try {
        const response = await API.post("chat/conversation/send", data)
        return response.data
    } catch (error) {
        console.error("Error opening message", error);
        throw error;
    }
}

export const getMessages = async (conversationId: number) => {
    try {
        const response = await API.get(`chat/conversation/${conversationId}`);
        console.log("Get messages:", response.data);
        return response.data.Messages || [];
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};