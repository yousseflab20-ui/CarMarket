import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  MicOff,
  Mic,
  User,
} from "lucide-react-native";
import {
  CallState,
  IncomingCall,
  InitiateCallArgs,
} from "../types/hooks/typeWebRTC";

const { width, height } = Dimensions.get("window");

interface CallScreenWebRtcProps {
  callState: CallState;
  incomingCall: IncomingCall | null;
  initiateCall: (args: InitiateCallArgs) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: (isMuted: boolean) => void;
  currentUser: { id: any; name: string; photo?: string };
  otherUser: { id: any; name: string; photo?: string };
}

const CallScreenWebRtc = ({
  callState,
  incomingCall,
  initiateCall,
  acceptCall,
  rejectCall,
  endCall,
  toggleMute,
  currentUser,
  otherUser,
}: CallScreenWebRtcProps) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    toggleMute(newState);
  };

  const avatarUri =
    callState === "incoming"
      ? "https://via.placeholder.com/100"
      : otherUser?.photo || "https://via.placeholder.com/100";

  const callerName =
    callState === "incoming"
      ? incomingCall?.callerName || "Unknown"
      : otherUser?.name || "Unknown";

  return (
    <View
      className="absolute top-0 left-0 right-0 bottom-0 z-[999] bg-[#080C14] justify-between items-center py-[80px]"
      style={{ width, height, elevation: 999 }}
    >
      {/* Background blur effect */}
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#080C14]/95" />

      {/* Avatar */}
      <View className="items-center gap-[12px]">
        <View className="w-[120px] h-[120px] rounded-[60px] border-[3px] border-[#6EE7B7] p-[3px] mb-[8px] items-center justify-center bg-[#141B27]">
          {avatarUri && !avatarUri.includes("placeholder") ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full rounded-[60px]"
            />
          ) : (
            <User size={50} color="#6EE7B7" />
          )}
        </View>
        <Text
          className="text-[#F1F5F9] text-[26px] tracking-[0.3px]"
          style={{ fontFamily: "Lexend_700Bold" }}
        >
          {callerName}
        </Text>
        <Text
          className="text-[#6EE7B7] text-[14px] tracking-[0.5px]"
          style={{ fontFamily: "Lexend_400Regular" }}
        >
          {callState === "calling" && "Calling..."}
          {callState === "incoming" && "Incoming call..."}
          {callState === "active" && "● Connected"}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-center items-center gap-[40px]">
        {callState === "incoming" && (
          <>
            {/* Reject */}
            <View className="items-center gap-[8px]">
              <TouchableOpacity
                className="w-[68px] h-[68px] rounded-[34px] items-center justify-center bg-[#EF4444]"
                onPress={rejectCall}
              >
                <PhoneOff size={28} color="#fff" />
              </TouchableOpacity>
              <Text
                className="text-[#94A3B8] text-[12px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                Decline
              </Text>
            </View>

            {/* Accept */}
            <View className="items-center gap-[8px]">
              <TouchableOpacity
                className="w-[68px] h-[68px] rounded-[34px] items-center justify-center bg-[#10B981]"
                onPress={acceptCall}
              >
                <Phone size={28} color="#fff" />
              </TouchableOpacity>
              <Text
                className="text-[#94A3B8] text-[12px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                Accept
              </Text>
            </View>
          </>
        )}

        {callState === "calling" && (
          <View className="items-center gap-[8px]">
            <TouchableOpacity
              className="w-[68px] h-[68px] rounded-[34px] items-center justify-center bg-[#EF4444]"
              onPress={endCall}
            >
              <PhoneOff size={28} color="#fff" />
            </TouchableOpacity>
            <Text
              className="text-[#94A3B8] text-[12px]"
              style={{ fontFamily: "Lexend_400Regular" }}
            >
              Cancel
            </Text>
          </View>
        )}

        {callState === "active" && (
          <>
            {/* Mute */}
            <View className="items-center gap-[8px]">
              <TouchableOpacity
                className={`w-[68px] h-[68px] rounded-[34px] items-center justify-center border ${
                  isMuted
                    ? "bg-[#EF4444]/20 border-[#EF4444]"
                    : "bg-[#1E293B] border-[#6EE7B7]/25"
                }`}
                onPress={handleToggleMute}
              >
                {isMuted ? (
                  <MicOff size={24} color="#fff" />
                ) : (
                  <Mic size={24} color="#fff" />
                )}
              </TouchableOpacity>
              <Text
                className="text-[#94A3B8] text-[12px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                {isMuted ? "Unmute" : "Mute"}
              </Text>
            </View>

            {/* End call */}
            <View className="items-center gap-[8px]">
              <TouchableOpacity
                className="w-[68px] h-[68px] rounded-[34px] items-center justify-center bg-[#EF4444]"
                onPress={endCall}
              >
                <PhoneOff size={28} color="#fff" />
              </TouchableOpacity>
              <Text
                className="text-[#94A3B8] text-[12px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                End
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default CallScreenWebRtc;
