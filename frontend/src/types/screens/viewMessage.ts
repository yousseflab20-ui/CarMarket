import { Message } from "../chat";
export { Message };




export interface MessageDetailParams {
    conversationId: string;
    otherUserId: string;
    otherUserName?: string;
    otherUserPhoto?: string;
}

export interface CallErrorModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export interface AnimatedSendButtonProps {
    onPress: () => void;
    disabled: boolean;
    isPending: boolean;
    hasText: boolean;
}

export interface AudioPlayerProps {
    audioUrl: string;
    isMe: boolean;
}

export interface MessageBubbleProps {
    item: Message;
    isMe: boolean;
    index: number;
    onLongPress: () => void;
}
