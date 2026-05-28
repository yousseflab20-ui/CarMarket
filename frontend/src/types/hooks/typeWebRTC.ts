import { RTCPeerConnection, MediaStream } from "react-native-webrtc";

export type CallState = "idle" | "calling" | "incoming" | "active" | "ended";

export interface IncomingCall {
  callerId?: string | number;
  callerName: string;
  socketId: string;
}

export interface InitiateCallArgs {
  targetUserId: string | number;
  callerName: string;
}

export interface CallAcceptedArgs {
  socketId: string;
}

export interface WebRTCOfferArgs {
  offer: any;
  fromSocketId: string;
}

export interface WebRTCAnswerArgs {
  answer: any;
}

export interface IceCandidateArgs {
  candidate: any;
}

export interface UseWebRTCReturn {
  callState: CallState;
  incomingCall: IncomingCall | null;
  initiateCall: (args: InitiateCallArgs) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: (isMuted: boolean) => void;
}

export interface CustomRTCPeerConnection extends RTCPeerConnection {
  _targetUserId?: string | number;
  _targetSocketId?: string;
}
