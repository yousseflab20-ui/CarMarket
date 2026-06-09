import { io, Socket } from "socket.io-client";
import { AppState, AppStateStatus } from "react-native";
import API_URL from "../constant/URL";

class SocketService {
  private static instance: SocketService;
  public socket: Socket;
  private userId: string | null = null;

  private constructor() {
    const socketUrl = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;
    this.socket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
      // ─── Reconnection settings ─────────────────────────────────
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,      // wait 1s before first retry
      reconnectionDelayMax: 5000,   // max 5s between retries
      // ─── Keep-alive (prevents idle disconnects) ────────────────
      // Server pingInterval/pingTimeout must be higher than these
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected", this.socket.id);
      // Re-join room automatically after reconnect
      if (this.userId) {
        console.log(`🔄 Re-joining room for user ${this.userId} after reconnect`);
        this.socket.emit("user_online", this.userId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    // ─── AppState Listener ────────────────────────────────────────
    // When app returns from background, force-reconnect the socket
    // and re-join the user room so missed socket events are handled.
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  private handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState === "active") {
      if (!this.socket.connected) {
        console.log("📱 App active — reconnecting socket...");
        this.socket.connect();
      } else if (this.userId) {
        // Socket already connected — just re-join room in case server dropped it
        console.log("📱 App active — re-joining room for user", this.userId);
        this.socket.emit("user_online", this.userId);
      }
    }
  };

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /** Call this after login so the service knows the current user */
  public setUserId(userId: string | number) {
    this.userId = userId.toString();
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

