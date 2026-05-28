import { useEffect, useRef, useState } from "react";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from "react-native-webrtc";
import { Socket } from "socket.io-client";
import {
  CallState,
  IncomingCall,
  InitiateCallArgs,
  CallAcceptedArgs,
  WebRTCOfferArgs,
  WebRTCAnswerArgs,
  IceCandidateArgs,
  UseWebRTCReturn,
  CustomRTCPeerConnection,
} from "../types/hooks/typeWebRTC";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (socket: Socket | null): UseWebRTCReturn => {
  const [callState, setCallState] = useState<CallState>("idle");
  // idle | calling | incoming | active | ended

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  // { callerId, callerName, socketId }

  const peerConnection = useRef<CustomRTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  // ─── Utils ───────────────────────────────────────

  const getLocalStream = async (): Promise<MediaStream> => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    localStream.current = stream as MediaStream;
    return localStream.current;
  };

  const createPeerConnection = (
    targetSocketId: string | null,
  ): CustomRTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS) as CustomRTCPeerConnection;

    (pc as any).onicecandidate = ({ candidate }: any) => {
      if (candidate && socket) {
        socket.emit("webrtc:ice-candidate", { candidate, targetSocketId });
      }
    };

    // Connection state
    (pc as any).onconnectionstatechange = () => {
      if ((pc as any).connectionState === "connected") setCallState("active");
      if (
        ["disconnected", "failed", "closed"].includes(
          (pc as any).connectionState,
        )
      ) {
        endCall();
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  // ─── CALLER (Buyer) ──────────────────────────────

  const initiateCall = async ({
    targetUserId,
    callerName,
  }: InitiateCallArgs): Promise<void> => {
    try {
      if (!socket) return;
      setCallState("calling");
      const stream = await getLocalStream();
      const pc = createPeerConnection(null); // socketId jad men call:accepted

      stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

      pc._targetUserId = targetUserId;

      socket.emit("call:initiate", { targetUserId, callerName });
    } catch (err) {
      console.error("initiateCall error:", err);
      setCallState("idle");
    }
  };

  const handleCallAccepted = async ({ socketId }: CallAcceptedArgs) => {
    try {
      setCallState("active"); // Update UI immediately to connected state
      const pc = peerConnection.current;
      if (!pc || !socket) return;
      pc._targetSocketId = socketId;

      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);

      socket.emit("webrtc:offer", { offer, targetSocketId: socketId });
    } catch (err) {
      console.error("handleCallAccepted error:", err);
    }
  };

  // ─── RECEIVER (Seller) ───────────────────────────

  const acceptCall = async (): Promise<void> => {
    try {
      if (!incomingCall || !socket) return;
      const { socketId } = incomingCall;
      const stream = await getLocalStream();
      const pc = createPeerConnection(socketId);

      stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

      socket.emit("call:accepted", { targetSocketId: socketId });
      setCallState("active");
    } catch (err) {
      console.error("acceptCall error:", err);
    }
  };

  const rejectCall = (): void => {
    if (socket) {
      socket.emit("call:rejected", { targetSocketId: incomingCall?.socketId });
    }
    setIncomingCall(null);
    setCallState("idle");
  };

  const handleOffer = async ({ offer, fromSocketId }: WebRTCOfferArgs) => {
    try {
      const pc = peerConnection.current;
      if (!pc || !socket) return;
      pc._targetSocketId = fromSocketId;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc:answer", { answer, targetSocketId: fromSocketId });
    } catch (err) {
      console.error("handleOffer error:", err);
    }
  };

  const handleAnswer = async ({ answer }: WebRTCAnswerArgs) => {
    try {
      const pc = peerConnection.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("handleAnswer error:", err);
    }
  };

  const handleIceCandidate = async ({ candidate }: IceCandidateArgs) => {
    try {
      const pc = peerConnection.current;
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error("handleIceCandidate error:", err);
    }
  };

  // ─── END CALL & MUTE ────────────────────────────

  const toggleMute = (isMuted: boolean) => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track: any) => {
        track.enabled = !isMuted;
      });
    }
  };

  const endCall = (): void => {
    const pc = peerConnection.current;
    if (pc) {
      if (pc._targetSocketId && socket) {
        socket.emit("call:ended", { targetSocketId: pc._targetSocketId });
      }
      pc.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((t: any) => t.stop());
      localStream.current = null;
    }
    setCallState("idle");
    setIncomingCall(null);
  };

  // ─── SOCKET LISTENERS ────────────────────────────

  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", (data: IncomingCall) => {
      setIncomingCall(data);
      setCallState("incoming");
    });

    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", () => {
      setCallState("idle");
    });
    socket.on("call:ended", () => endCall());
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
    };
  }, [socket]);

  // ─── RETURN ──────────────────────────────────────

  return {
    callState,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  };
};
