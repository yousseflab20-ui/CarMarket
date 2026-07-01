import { User } from "./user";

export interface Message {
  id: number;
  content: string;
  senderId: number | string;
  conversationId: number;
  createdAt: string;
  audioUrl?: string;
  imageUrl?: string;
  type?: "text" | "audio" | "location" | "image" | "call";
  latitude?: number;
  longitude?: number;
  sender?: User;
  reactions?: Array<{
    emoji: string;
    userId: number;
  }>;
  deletedForEveryone?: boolean;
  deletedBySender?: boolean;
  seen?: boolean;
  delivered?: boolean;
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
