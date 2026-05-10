import { create } from 'zustand';

export interface ToastItem {
    id: string;
    title: string;
    description?: string;
    type: 'success' | 'error' | 'info';
}

interface ToastStore {
    toasts: ToastItem[];
    addToast: (toast: Omit<ToastItem, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useStackedToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => set((state) => {
        const id = Math.random().toString(36).substring(7);
        return { toasts: [{ ...toast, id }, ...state.toasts].slice(0, 3) };
    }),
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
    })),
}));
