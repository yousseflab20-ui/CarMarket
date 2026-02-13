import { create } from 'zustand';

interface Message {
    id: number;
    content: string;
    senderId: number;
    conversationId: number;
    createdAt: string;
}

interface ChatState {
    messages: { [conversationId: number]: Message[] };
    addMessage: (conversationId: number, message: Message) => void;
    setMessages: (conversationId: number, messages: Message[]) => void;
    getMessages: (conversationId: number) => Message[];
}

export const useChatStore = create<ChatState>((set, get) => {
    // ❌ REMOVE socket listener from store - handle it in component only
    // This was causing duplicate message additions

    return {
        messages: {},

        addMessage: (conversationId, message) => {
            set((state) => {
                const currentMessages = state.messages[conversationId] || [];

                // ✅ Check if message already exists (prevent duplicates)
                const messageExists = currentMessages.some(
                    (msg) => msg.id === message.id ||
                        (msg.content === message.content &&
                            msg.senderId === message.senderId &&
                            Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
                );

                if (messageExists) {
                    return state; // Don't add duplicate
                }

                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: [...currentMessages, message],
                    },
                };
            });
        },

        setMessages: (conversationId, messages) => {
            set((state) => ({
                messages: {
                    ...state.messages,
                    [conversationId]: messages,
                },
            }));
        },

        getMessages: (conversationId) => get().messages[conversationId] || [],
    };
});