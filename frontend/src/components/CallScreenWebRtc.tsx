import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Modal,
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

const CALL = {
  whatsappBg: "#06110D",
  border: "rgba(255,255,255,0.1)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  green: "#22C55E",
  greenSoft: "rgba(34,197,94,0.16)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.16)",
  amber: "#FBBF24",
};

const styles = StyleSheet.create({
  incomingShell: {
    position: "absolute",
    top: 48,
    left: 14,
    right: 14,
    zIndex: 9999,
    elevation: 999,
  },
  incomingCard: {
    minHeight: 88,
    borderRadius: 28,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(7, 10, 22, 0.96)",
    borderWidth: 1,
    borderColor: CALL.border,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  avatarSm: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    borderWidth: 2,
    borderColor: "rgba(34,197,94,0.65)",
  },
  fullScreen: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: CALL.whatsappBg,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 42,
  },
  profileSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 82,
  },
  avatarLg: {
    width: 124,
    height: 124,
    borderRadius: 62,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#12352B",
  },
  statusPill: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  controlDock: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  controlItem: {
    alignItems: "center",
    gap: 9,
    minWidth: 74,
  },
  roundControl: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: CALL.border,
  },
  endControl: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CALL.red,
    shadowColor: CALL.red,
    shadowOpacity: 0.36,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
});

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
  const statusLabel =
    callState === "calling"
      ? "Calling..."
      : callState === "active"
        ? "Connected"
        : "Incoming call";
  const statusColor = callState === "calling" ? CALL.amber : CALL.green;

  // ─── BANNER (incoming only) ────────────────────────────────────────
  if (callState === "incoming") {
    return (
      <Animated.View
        style={[styles.incomingShell, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.incomingCard}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Animated.View
              style={[styles.avatarSm, { transform: [{ scale: pulseAnim }], marginRight: 12 }]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <User size={24} color={CALL.green} />
              )}
            </Animated.View>

            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{ fontFamily: "Lexend_700Bold", color: CALL.text, fontSize: 16, marginBottom: 4 }}
                numberOfLines={1}
              >
                {callerName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: CALL.green,
                  }}
                />
                <Text style={{ fontFamily: "Lexend_500Medium", color: CALL.muted, fontSize: 12 }}>
                  Incoming call...
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
            <TouchableOpacity
              onPress={rejectCall}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: CALL.red,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PhoneOff size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={acceptCall}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: CALL.green,
                alignItems: "center",
                justifyContent: "center",
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
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={endCall}
    >
      <View style={styles.fullScreen}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLg}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <User size={56} color={CALL.green} />
            )}
          </View>

        <Text
          style={{
            marginTop: 26,
            fontFamily: "Lexend_800ExtraBold",
            color: CALL.text,
            fontSize: 31,
            letterSpacing: 0,
          }}
          numberOfLines={1}
        >
          {callerName}
        </Text>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                callState === "calling" ? "rgba(251,191,36,0.1)" : CALL.greenSoft,
              borderColor:
                callState === "calling"
                  ? "rgba(251,191,36,0.22)"
                  : "rgba(34,197,94,0.25)",
            },
          ]}
        >
          <Animated.View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: statusColor,
              opacity: callState === "active" ? glowAnim : 1,
            }}
          />
          <Text
            style={{
              marginLeft: 8,
              fontFamily: "Lexend_700Bold",
              color: statusColor,
              fontSize: 13,
            }}
          >
            {statusLabel}
          </Text>
        </View>

        {callState === "active" && (
          <Text
            style={{
              marginTop: 18,
              fontFamily: "Lexend_400Regular",
              color: CALL.muted,
              fontSize: 20,
              letterSpacing: 1.4,
            }}
          >
            {formatTime(seconds)}
          </Text>
        )}
        </View>

        <View style={styles.controlDock}>
          <View style={styles.controlsRow}>
            {callState === "calling" && (
              <View style={styles.controlItem}>
                <TouchableOpacity onPress={endCall} style={styles.endControl}>
                  <PhoneOff size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={{ fontFamily: "Lexend_500Medium", color: CALL.muted, fontSize: 12 }}>
                  Cancel
                </Text>
              </View>
            )}

            {callState === "active" && (
              <>
                <View style={styles.controlItem}>
                  <TouchableOpacity
                    onPress={handleToggleMute}
                    style={[
                      styles.roundControl,
                      isMuted && {
                        backgroundColor: CALL.redSoft,
                        borderColor: "rgba(239,68,68,0.4)",
                      },
                    ]}
                  >
                    {isMuted ? (
                      <MicOff size={23} color={CALL.red} />
                    ) : (
                      <Mic size={23} color={CALL.text} />
                    )}
                  </TouchableOpacity>
                  <Text style={{ fontFamily: "Lexend_500Medium", color: CALL.muted, fontSize: 12 }}>
                    {isMuted ? "Unmute" : "Mute"}
                  </Text>
                </View>

              <View style={styles.controlItem}>
                <TouchableOpacity onPress={endCall} style={styles.endControl}>
                  <PhoneOff size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={{ fontFamily: "Lexend_500Medium", color: CALL.muted, fontSize: 12 }}>
                  End
                </Text>
              </View>

              <View style={styles.controlItem}>
                <TouchableOpacity
                  onPress={handleToggleSpeaker}
                  style={[
                    styles.roundControl,
                    isSpeakerOn && {
                      backgroundColor: CALL.greenSoft,
                      borderColor: "rgba(34,197,94,0.4)",
                    },
                  ]}
                >
                  {isSpeakerOn ? (
                    <Volume2 size={23} color={CALL.green} />
                  ) : (
                    <VolumeX size={23} color={CALL.text} />
                  )}
                </TouchableOpacity>
                <Text style={{ fontFamily: "Lexend_500Medium", color: CALL.muted, fontSize: 12 }}>
                  Speaker
                </Text>
              </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

};

export default CallScreenWebRtc;
