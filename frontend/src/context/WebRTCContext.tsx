import React, { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useWebRTC } from "../hooks/useWebRTC";
import SocketService from "../service/SocketService";
import { UseWebRTCReturn } from "../types/hooks/typeWebRTC";
import CallScreenWebRtc from "../components/CallScreenWebRtc";
import { useAuthStore } from "../store/authStore";
import API from "../service/api";

const WebRTCContext = createContext<UseWebRTCReturn | null>(null);

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTCContext must be used within a WebRTCProvider");
  }
  return context;
};

interface WebRTCProviderProps {
  children: ReactNode;
}

export const WebRTCProvider = ({ children }: WebRTCProviderProps) => {
  const socket = SocketService.getInstance().getSocket();
  const webRTC = useWebRTC(socket);
  const user = useAuthStore((state) => state.user);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // ─── Pending call check ───────────────────────────────────────────
  // When the app returns from background, the socket may have missed
  // the `call:incoming` event. We query the backend for any "initiated"
  // call targeting this user and show the incoming call UI if found.
  const checkPendingCall = async () => {
    if (!user?.id || webRTC.callState !== "idle") return;
    try {
      const res = await API.get("/call/pending");
      const call = res.data?.call;
      if (call) {
        console.log("📞 Pending call found after reconnect:", call);
        // Manually trigger the incoming call state
        // The caller's socket is unknown at this point — we set socketId to ""
        // The backend will match by callId when the caller retries signaling.
        webRTC.incomingCall; // accessed for type-check; real trigger below:
        socket.emit("call:check_pending", { callId: call.id });
      }
    } catch (err) {
      console.warn("Could not check pending calls:", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Check pending calls whenever socket reconnects
    const handleReconnect = () => {
      console.log("🔄 Socket reconnected — checking for pending calls...");
      checkPendingCall();
    };
    socket.on("connect", handleReconnect);

    // Check pending calls when app comes to foreground
    const handleAppState = (nextState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        console.log("📱 App active — checking for pending calls...");
        checkPendingCall();
      }
      appState.current = nextState;
    };
    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      socket.off("connect", handleReconnect);
      subscription.remove();
    };
  }, [user?.id, webRTC.callState]);

  return (
    <WebRTCContext.Provider value={webRTC}>
      {children}
      {webRTC.callState !== "idle" && (
        <CallScreenWebRtc
          callState={webRTC.callState}
          incomingCall={webRTC.incomingCall}
          initiateCall={webRTC.initiateCall}
          acceptCall={webRTC.acceptCall}
          rejectCall={webRTC.rejectCall}
          endCall={webRTC.endCall}
          toggleMute={webRTC.toggleMute}
          toggleSpeaker={webRTC.toggleSpeaker}
          currentUser={{
            id: user?.id,
            name: user?.name || "Me",
            photo: user?.photo,
          }}
          otherUser={{
            id: webRTC.otherUser?.id,
            name: webRTC.otherUser?.name || "User",
            photo: webRTC.otherUser?.photo,
          }}
        />
      )}
    </WebRTCContext.Provider>
  );
};
