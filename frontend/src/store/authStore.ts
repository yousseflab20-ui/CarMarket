import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

// Initialize MMKV
export const storage = createMMKV({
    id: 'auth-storage',
});

// Create a custom storage adapter for Zustand
const mmkvStorage: StateStorage = {
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    setItem: (name, value) => {
        storage.set(name, value);
    },
    removeItem: (name) => {
        storage.remove(name);
    },
};

interface User {
    id: string;
    name: string;
    email: string;
    // Add other user properties as needed
    [key: string]: any;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            setToken: (token) => set({ token, isAuthenticated: !!token }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
