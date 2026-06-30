import API from "../api";

export const message = async (user2Id: number) => {
  try {
    const response = await API.post(`chat/conversation/${user2Id}`);
    console.log("Open message:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error opening conversation:", error);
    throw error;
  }
};

export const createConversation = async (data: {
  conversationId: number;
  content: string;
  senderId?: string | number;
  receiverId?: number;
}) => {
  try {
    const response = await API.post("chat/conversation/send", data);
    console.log("Send message response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getMessages = async (conversationId: number) => {
  try {
    const response = await API.get(`chat/conversation/${conversationId}`);
    console.log("Get messages:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await API.get("chat/allconversation");
    console.log("Get conversations:", response.data);
    return response.data.allConversations || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getUnreadCount = async (userId: number) => {
  try {
    const response = await API.get(`chat/unread/${userId}`);
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

export const getUnreadConversations = async (userId: number) => {
  try {
    const response = await API.get(`chat/unread-conversations/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching unread conversations:", error);
    return [];
  }
};

export const markSeen = async (userId: number, conversationId: number) => {
  try {
    const response = await API.put("chat/mark-seen", {
      userId,
      conversationId,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking messages as seen:", error);
  }
};

export const uploadAudioMessage = async (data: FormData) => {
  try {
    const response = await API.post("chat/conversation/send-audio", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Audio send response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading audio message:", error);
    throw error;
  }
};

export const uploadImageMessage = async (data: FormData) => {
  try {
    const response = await API.post("chat/conversation/send-image", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Image send response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading image message:", error);
    throw error;
  }
};

export const addReaction = async (data: {
  messageId: number;
  emoji: string;
}) => {
  try {
    const response = await API.post(`reaction/${data.messageId}`, {
      emoji: data.emoji,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
};

export const deleteMessageForMe = async (messageIds: number[]) => {
  try {
    const response = await API.post(`chat/message/delete-bulk/for-me`, {
      messageIds,
    });
    console.log("data delte message");
    return response.data;
  } catch (error) {
    console.error("Error delete message for me:", error);
    throw error;
  }
};

export const deleteMessageForEveryone = async (id: number) => {
  try {
    const reponse = await API.delete(`chat/message/${id}/for-everyone`);
    return reponse.data;
  } catch (error) {
    throw error;
  }
};
