import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({
    id: "Storage-profile-User"
});

export default storage;

// Pause storage Profile