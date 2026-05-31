import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  MicOff,
  Mic,
  User,
  Volume2,
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
  toggleSpeaker: () => void;
}

const CallScreenWebRtc = ({
  callState,
  incomingCall,
  initiateCall,
  acceptCall,
  rejectCall,
  toggleSpeaker,
  endCall,
  toggleMute,
  currentUser,
  otherUser,
}: CallScreenWebRtcProps) => {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = React.useState(false);

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    toggleMute(newState);
  };

  const handleToggleSpeaker = () => {
    const newState = !isSpeakerOn;
    setIsSpeakerOn(newState);
    toggleSpeaker();
  };

  const avatarUri =
    callState === "incoming"
      ? "https://via.placeholder.com/100"
      : otherUser?.photo || "https://via.placeholder.com/100";

  const callerName =
    callState === "incoming"
      ? incomingCall?.callerName || "Unknown"
      : otherUser?.name || "Unknown";

  if (callState === "incoming") {
    return (
      <View
        className="absolute top-[50px] left-[16px] right-[16px] z-[9999] bg-[#1E293B]/95 rounded-[20px] border border-white/10 shadow-2xl px-[16px] py-[14px] flex-row items-center justify-between"
        style={{ elevation: 999 }}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-[46px] h-[46px] rounded-[23px] border-[2px] border-[#6EE7B7] items-center justify-center bg-[#0F172A] overflow-hidden mr-[12px]">
            {avatarUri && !avatarUri.includes("placeholder") ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <User size={24} color="#6EE7B7" />
            )}
          </View>
          <View className="flex-1 mr-[8px]">
            <Text
              className="text-[#F8FAFC] text-[16px] tracking-[0.2px] mb-[2px]"
              style={{ fontFamily: "Lexend_600SemiBold" }}
              numberOfLines={1}
            >
              {callerName}
            </Text>
            <Text
              className="text-[#6EE7B7] text-[12px] tracking-[0.3px]"
              style={{ fontFamily: "Lexend_400Regular" }}
            >
              Incoming call...
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-[12px]">
          <TouchableOpacity
            className="w-[40px] h-[40px] rounded-[20px] items-center justify-center bg-[#EF4444]"
            onPress={rejectCall}
          >
            <PhoneOff size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[40px] h-[40px] rounded-[20px] items-center justify-center bg-[#10B981]"
            onPress={acceptCall}
          >
            <Phone size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Full screen view for "calling" and "active"
  return (
    <View
      className="absolute top-0 left-0 right-0 bottom-0 z-[9999] bg-[#080C14] justify-between items-center py-[80px]"
      style={{ width, height, elevation: 999 }}
    >
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#080C14]/95" />

      <View className="items-center gap-[12px]">
        <View className="w-[120px] h-[120px] rounded-[60px] border-[3px] border-[#6EE7B7] p-[3px] mb-[8px] items-center justify-center bg-[#141B27]">
          {avatarUri && !avatarUri.includes("placeholder") ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full rounded-[60px]"
              resizeMode="cover"
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
          {callState === "active" && "● Connected"}
        </Text>
      </View>

      <View className="flex-row justify-center items-center gap-[40px]">
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

            <View className="items-center gap-[8px]">
              <TouchableOpacity
                className={`w-[68px] h-[68px] rounded-[34px] items-center justify-center ${
                  isSpeakerOn
                    ? "bg-[#EF4444]/20 border-[#EF4444]"
                    : "bg-[#1E293B] border-[#6EE7B7]/25"
                }`}
                onPress={handleToggleSpeaker}
              >
                {isSpeakerOn ? (
                  <Volume2 size={28} color="#fff" />
                ) : (
                  <Volume2 size={28} color="#fff" />
                )}
              </TouchableOpacity>
              <Text
                className="text-[#94A3B8] text-[12px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                Speaker
              </Text>
            </View>

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
