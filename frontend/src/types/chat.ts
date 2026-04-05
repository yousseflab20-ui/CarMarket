import { User } from "./user";

export interface Message {
    id: number;
    content: string;
    senderId: number | string;
    conversationId: number;
    createdAt: string;
    audioUrl?: string;
    type?: "text" | "audio" | "location";
    latitude?: number;
    longitude?: number;
    sender?: User;
    reactions?: Array<{
        emoji: string;
        userId: number;
    }>;
}

export interface Conversation {
    id: number;
    user1Id: number;
    user2Id: number;
    createdAt: string;
    updatedAt: string;
    user1?: User;
    user2?: User;
    Messages?: Message[];
}
