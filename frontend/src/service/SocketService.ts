import { io, Socket } from "socket.io-client";
import API_URL from "../constant/URL";

class SocketService {
    private static instance: SocketService;
    public socket: Socket;

    private constructor() {
        const socketUrl = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
        this.socket = io(socketUrl, {
            transports: ["websocket"],
            autoConnect: true,
        });

        this.socket.on("connect", () => console.log("✅ Socket connected", this.socket.id));
        this.socket.on("disconnect", () => console.log("❌ Socket disconnected"));
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public emit(event: string, data: any, callback?: (response: any) => void) {
        this.socket.emit(event, data, callback);
    }

    public on(event: string, callback: (...args: any[]) => void) {
        this.socket.on(event, callback);
    }

    public off(event: string, callback?: (...args: any[]) => void) {
        this.socket.off(event, callback);
    }
}

export default SocketService;
