import React, { createContext, useContext, ReactNode } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import SocketService from "../service/SocketService";
import { UseWebRTCReturn } from "../types/hooks/typeWebRTC";
import CallScreenWebRtc from "../components/CallScreenWebRtc";
import { useAuthStore } from "../store/authStore";

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
