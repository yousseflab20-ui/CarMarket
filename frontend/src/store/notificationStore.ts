import { create } from 'zustand';

interface NotificationData {
    title: string;
    body: string;
    data?: any;
}

interface NotificationState {
    isVisible: boolean;
    notification: NotificationData | null;
    /** Last FCM device token from Firebase Messaging (updated after permission + on refresh). */
    pushToken: string | null;
    showNotification: (notification: NotificationData) => void;
    hideNotification: () => void;
    setPushToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    isVisible: false,
    notification: null,
    pushToken: null,
    showNotification: (notification) => set({
        isVisible: true,
        notification
    }),
    hideNotification: () => set({
        isVisible: false,
        notification: null
    }),
    setPushToken: (token) => set({ pushToken: token }),
}));
