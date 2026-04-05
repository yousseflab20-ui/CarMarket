import { User } from "../user";

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    refreshProfile: () => Promise<void>;
}
