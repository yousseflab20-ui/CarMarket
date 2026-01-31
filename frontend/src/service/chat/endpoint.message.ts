import API from "../api";

export const message = async (user2Id: number) => {

    try {
        const response = await API.post(`chat/conversation/${user2Id}`);
        console.log("Open message:", response.data);
        // return response.data;
    } catch (error) {
        console.error("Error opening conversation:", error);
        throw error;
    }
};

export const createConvirsastion = async (data: { conversationId: number; content: string; senderId?: string | number }) => {
    try {
        const response = await API.post("chat/conversation/send", data)
        console.log("Open conversation:", response.data);
        // return response.data
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

export const getConversations = async () => {
    try {
        const response = await API.get("chat/allconversation");
        console.log("Get conversations:", response.data);
        // return response.data.allConversations || [];s
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
};