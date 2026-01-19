import { log } from "console";
import API from "../api";



export const message = async (user2Id: number) => {
    try {
        const response = await API.post(`chat/conversation/${user2Id}`);
        console.log("Open conversation:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error opening conversation:", error);
        throw error;
    }
};