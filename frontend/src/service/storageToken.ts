import { createMMKV } from "react-native-mmkv"

const storage = createMMKV({
    id: "appStorage"
})

export const setItem = (Key: string, value: string) => {
    storage.set(Key, value)
}

export const getItem = (key: string) => {
    const value = storage.getString(key);
    return value;
}

export const removeItem = (key: string) => {
    (storage as any).delete(key);
};

export const setToken = (token: string) => storage.set("token", token);

export const getToken = (): string | undefined => storage.getString("token");

export const removeToken = () => (storage as any).delete("token");

export default {
    setToken,
    getToken,
    removeToken,
}