import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import {
  Phone,
  PhoneOff,
  MicOff,
  Mic,
  User,
  Volume2,
  VolumeX,
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
  acceptCall,
  rejectCall,
  endCall,
  toggleMute,
  toggleSpeaker,
  currentUser,
  otherUser,
}: CallScreenWebRtcProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Animations
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    // Slide in banner
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 70,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, []);

  // Glow pulse for active call
  useEffect(() => {
    if (callState === "active") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      // Timer
      const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  // Avatar ring pulse for incoming
  useEffect(() => {
    if (callState === "incoming" || callState === "calling") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [callState]);

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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const avatarUri =
    callState === "incoming"
      ? incomingCall?.callerPhoto || ""
      : otherUser?.photo || "";

  const callerName =
    callState === "incoming"
      ? incomingCall?.callerName || "Unknown"
      : otherUser?.name || "Unknown";

  // ─── BANNER (incoming only) ────────────────────────────────────────
  if (callState === "incoming") {
    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 50,
          left: 16,
          right: 16,
          zIndex: 9999,
          elevation: 999,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.97)",
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(110, 231, 183, 0.2)",
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#6EE7B7",
            shadowOpacity: 0.15,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {/* Left: avatar + info */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: callState === "incoming" ? "#10B981" : "#6EE7B7",
                overflow: "hidden",
                marginRight: 12,
                backgroundColor: "#0F172A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <User size={24} color="#6EE7B7" />
              )}
            </Animated.View>

            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{ fontFamily: "Lexend_600SemiBold", color: "#F8FAFC", fontSize: 16, marginBottom: 2 }}
                numberOfLines={1}
              >
                {callerName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#10B981",
                  }}
                />
                <Text style={{ fontFamily: "Lexend_400Regular", color: "#94A3B8", fontSize: 12 }}>
                  Incoming call...
                </Text>
              </View>
            </View>
          </View>

          {/* Right: action buttons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={rejectCall}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#EF4444",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#EF4444",
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <PhoneOff size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={acceptCall}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#10B981",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#10B981",
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <Phone size={18} color="#fff" />
            </TouchableOpacity>

          </View>
        </View>
      </Animated.View>
    );
  }

  // ─── FULL SCREEN (calling + active) ─────────────────────────────────
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width,
        height,
        zIndex: 9999,
        elevation: 999,
        backgroundColor: "#080C14",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 80,
        paddingBottom: 60,
      }}
    >
      {/* Ambient glow background */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.15,
          alignSelf: "center",
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: "#6EE7B7",
          opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.1] }),
          transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
        }}
      />

      {/* Top info */}
      <View style={{ alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          {/* Outer glow ring */}
          <Animated.View
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 1,
              borderColor: "#6EE7B7",
              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
              transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
            }}
          />
          <View
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              borderWidth: 3,
              borderColor: "#6EE7B7",
              overflow: "hidden",
              backgroundColor: "#141B27",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <User size={54} color="#6EE7B7" />
            )}
          </View>
        </View>

        <Text style={{ fontFamily: "Lexend_700Bold", color: "#F1F5F9", fontSize: 28, letterSpacing: 0.3 }}>
          {callerName}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Animated.View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: callState === "calling" ? "#FBBF24" : "#6EE7B7",
              opacity: callState === "active" ? glowAnim : 1,
            }}
          />
          <Text style={{ fontFamily: "Lexend_400Regular", color: callState === "calling" ? "#FBBF24" : "#6EE7B7", fontSize: 14, letterSpacing: 0.5 }}>
            {callState === "calling" ? "Calling..." : "Connected"}
          </Text>
        </View>

        {/* Timer */}
        {callState === "active" && (
          <Text style={{ fontFamily: "Lexend_300Light", color: "#475569", fontSize: 22, letterSpacing: 2 }}>
            {formatTime(seconds)}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 28 }}>
        {/* Cancel (calling only) */}
        {callState === "calling" && (
          <View style={{ alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={endCall}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#EF4444",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#EF4444",
                shadowOpacity: 0.5,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <PhoneOff size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={{ fontFamily: "Lexend_400Regular", color: "#64748B", fontSize: 12 }}>
              Cancel
            </Text>
          </View>
        )}
        {/* Mute (active only) */}
        {callState === "active" && (<>
        <View style={{ alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={handleToggleMute}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isMuted ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: isMuted ? "#EF4444" : "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMuted ? <MicOff size={24} color="#EF4444" /> : <Mic size={24} color="#F8FAFC" />}
          </TouchableOpacity>
          <Text style={{ fontFamily: "Lexend_400Regular", color: "#64748B", fontSize: 12 }}>
            {isMuted ? "Unmute" : "Mute"}
          </Text>
        </View>

        {/* End Call */}
        <View style={{ alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={endCall}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#EF4444",
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <PhoneOff size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Lexend_400Regular", color: "#64748B", fontSize: 12 }}>
            End
          </Text>
        </View>

        {/* Speaker */}
        <View style={{ alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={handleToggleSpeaker}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isSpeakerOn ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: isSpeakerOn ? "#6EE7B7" : "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSpeakerOn ? <Volume2 size={24} color="#6EE7B7" /> : <VolumeX size={24} color="#F8FAFC" />}
          </TouchableOpacity>
          <Text style={{ fontFamily: "Lexend_400Regular", color: "#64748B", fontSize: 12 }}>
            Speaker
          </Text>
        </View>
        </>)}
      </View>
    </View>
  );
};

export default CallScreenWebRtc;
