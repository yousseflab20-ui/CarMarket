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
    unreadCount: number;
    unreadCountsByConversation: { [conversationId: number]: number };
    setUnreadCount: (count: number) => void;
    setUnreadCountsByConversation: (unreadMap: { [conversationId: number]: number }) => void;
    incrementUnreadCount: (conversationId?: number) => void;
    resetUnreadCount: (conversationId?: number) => void;
    addMessage: (conversationId: number, message: Message) => void;
    setMessages: (conversationId: number, messages: Message[]) => void;
    getMessages: (conversationId: number) => Message[];
}

export const useChatStore = create<ChatState>((set, get) => {
    return {
        messages: {},
        unreadCount: 0,
        unreadCountsByConversation: {},

        setUnreadCount: (count) => set({ unreadCount: count }),
        setUnreadCountsByConversation: (unreadMap) => set({ unreadCountsByConversation: unreadMap }),

        incrementUnreadCount: (conversationId) => set((state) => {
            const newState: any = { unreadCount: state.unreadCount + 1 };
            if (conversationId) {
                newState.unreadCountsByConversation = {
                    ...state.unreadCountsByConversation,
                    [conversationId]: (state.unreadCountsByConversation[conversationId] || 0) + 1,
                };
            }
            return newState;
        }),

        resetUnreadCount: (conversationId) => set((state) => {
            if (conversationId) {
                const conversationUnread = state.unreadCountsByConversation[conversationId] || 0;
                return {
                    unreadCount: Math.max(0, state.unreadCount - conversationUnread),
                    unreadCountsByConversation: {
                        ...state.unreadCountsByConversation,
                        [conversationId]: 0,
                    },
                };
            }
            return { unreadCount: 0, unreadCountsByConversation: {} };
        }),

        addMessage: (conversationId, message) => {
            set((state) => {
                const currentMessages = state.messages[conversationId] || [];
                const messageExists = currentMessages.some(
                    (msg) => msg.id === message.id ||
                        (msg.content === message.content &&
                            msg.senderId === message.senderId &&
                            Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
                );

                if (messageExists) {
                    return state;
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