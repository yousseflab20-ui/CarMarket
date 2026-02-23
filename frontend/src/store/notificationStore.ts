import { create } from 'zustand';

interface NotificationData {
    title: string;
    body: string;
    data?: any;
}

interface NotificationState {
    isVisible: boolean;
    notification: NotificationData | null;
    showNotification: (title: string, body: string, data?: any) => void;
    hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    isVisible: false,
    notification: null,
    showNotification: (title, body, data) => set({
        isVisible: true,
        notification: { title, body, data }
    }),
    hideNotification: () => set({
        isVisible: false,
        notification: null
    }),
}));
