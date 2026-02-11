import { io } from "socket.io-client";

export const socket = io("http://192.168.1.200:5000", {
    transports: ["websocket"],// force work reel-taime websockt
    autoConnect: false, // remove conect automatique
});
