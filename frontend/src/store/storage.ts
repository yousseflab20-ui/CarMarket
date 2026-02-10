import AsyncStorage from '@react-native-async-storage/async-storage';

export const asyncStorage = {
    getItem: async (name: string) => {
        const json = await AsyncStorage.getItem(name);
        return json;
    },
    setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
        await AsyncStorage.removeItem(name);
    },
};
