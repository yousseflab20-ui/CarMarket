import { io, Socket } from "socket.io-client";
import API_URL from "../constant/URL";

class SocketService {
    private static instance: SocketService;
    public socket: Socket | null = null;

    private constructor() {
        const socketUrl = API_URL.endsWith("/api")
            ? API_URL.slice(0, -4)
            : API_URL;

        this.socket = io(socketUrl, {
            transports: ["websocket"],
        });
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public getSocket(): Socket {
        if (!this.socket) {
            throw new Error("Socket not initialized");
        }
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default SocketService;
