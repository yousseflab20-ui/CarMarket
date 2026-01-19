import { log } from "console";
import API from "../api";

export const message = async () => {
    try {
        const response = await API.post(`chat/conversation`);
        console.log("open conversation", response.data);
        return response.data;
    } catch (error) {
        console.error("Error opening conversation:", error);
        throw error;
    }
};