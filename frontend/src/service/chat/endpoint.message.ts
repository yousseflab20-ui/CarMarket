import API from "../api";

export const message = async (user2Id: number) => {

    try {
        const response = await API.post(`/chat/conversation/${user2Id}`);
        console.log("Open message:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error opening conversation:", error);
        throw error;
    }
};

export const createConversation = async (data: { conversationId: number; content: string; senderId?: string | number; receiverId?: number }) => {
    try {
        const response = await API.post("/chat/conversation/send", data)
        console.log("Send message response:", response.data);
        return response.data
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

export const getMessages = async (conversationId: number) => {
    try {
        const response = await API.get(`/chat/conversation/${conversationId}`);
        console.log("Get messages:", response.data);
        return response.data.Messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};

export const getConversations = async () => {
    try {
        const response = await API.get("/chat/allconversation");
        console.log("Get conversations:", response.data);
        return response.data.allConversations || [];
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
};

export const getUnreadCount = async (userId: number) => {
    try {
        const response = await API.get(`/chat/unread/${userId}`);
        return response.data.count;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
};

export const getUnreadConversations = async (userId: number) => {
    try {
        const response = await API.get(`/chat/unread-conversations/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching unread conversations:", error);
        return [];
    }
};

export const markSeen = async (userId: number, conversationId: number) => {
    try {
        const response = await API.put("/chat/mark-seen", { userId, conversationId });
        return response.data;
    } catch (error) {
        console.error("Error marking messages as seen:", error);
    }
};