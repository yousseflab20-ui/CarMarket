import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Image,
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Send,
  BadgeCheck,
  Mic,
  Play,
  Pause,
  Phone,
  Paperclip,
  MapPinned,
  ImageIcon,
  Camera as CameraIcon,
  X,
  Copy,
  Trash2,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  getMessages,
  markSeen,
  uploadAudioMessage,
  uploadImageMessage,
  addReaction,
  message,
} from "../service/chat/endpoint.message";
import { getUser } from "../service/endpointService";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { AuthState } from "../types/store/auth";
import { useChatStore } from "../store/chatStore";

import { router, useLocalSearchParams } from "expo-router";
import SocketService from "../service/SocketService";
import { useWebRTCContext } from "../context/WebRTCContext";
import { Audio } from "expo-av";
import API_URL from "../constant/URL";
import * as Location from "expo-location";
import {
  Map,
  Camera,
  PointAnnotation,
  LogManager,
} from "@maplibre/maplibre-react-native";
import CameraScreenSignUp from "../components/CameraScreenSignUp";
import Clipboard from "@react-native-clipboard/clipboard";

// Suppress MapLibre warnings that cause JNI crashes on Android
LogManager.setLogLevel("error");
LogManager.onLog(() => true);
import { Linking } from "react-native";

import {
  Message,
  MessageBubbleProps,
  AudioPlayerProps,
  AnimatedSendButtonProps,
  MessageDetailParams,
} from "../types/screens/viewMessage";
import { useImagePermission } from "../hooks/useImagePermission";
import { BlurView } from "expo-blur";

function AnimatedSendButton({
  onPress,
  disabled,
  isPending,
  hasText,
}: AnimatedSendButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const iconSlide = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array.from({ length: 6 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  const triggerAnimation = () => {
    if (disabled) return;

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.82,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(iconSlide, {
        toValue: -7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(iconSlide, {
        toValue: 0,
        duration: 130,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
    ]).start();

    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.7);
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const angles = [0, 60, 120, 180, 240, 300];
    particles.forEach((p, i) => {
      const angle = (angles[i] * Math.PI) / 180;
      const distance = 28 + Math.random() * 14;
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.scale.setValue(0.5);
      Animated.parallel([
        Animated.timing(p.x, {
          toValue: Math.cos(angle) * distance,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.sin(angle) * distance,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    onPress();
  };

  useEffect(() => {
    // requestPermission(); // Moved to ViewMessageUse
  }, []);

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  return (
    <View className="w-[44px] h-[44px] items-center justify-center">
      <Animated.View
        className="absolute w-[44px] h-[44px] rounded-[22px] border-2 border-[#6EE7B7]"
        style={{ opacity: rippleOpacity, transform: [{ scale: rippleScale }] }}
      />

      {particles.map((p, i) => (
        <Animated.View
          key={i}
          className="absolute w-[6px] h-[6px] rounded-[3px] bg-[#6EE7B7]"
          style={{
            opacity: p.opacity,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { scale: p.scale },
            ],
          }}
        />
      ))}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          className="w-[44px] h-[44px] rounded-[22px] items-center justify-center border"
          style={[
            { shadowOpacity: 0, elevation: 0 },
            !hasText
              ? {
                  backgroundColor: "#141B27",
                  borderColor: "rgba(255,255,255,0.07)",
                }
              : {
                  backgroundColor: "#141B27",
                  borderColor: "rgba(110, 231, 183, 0.25)",
                },
          ]}
          onPress={triggerAnimation}
          disabled={disabled}
          activeOpacity={1}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Send size={18} color={hasText ? "#FFFFFF" : "#475569"} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function AudioPlayer({ audioUrl, isMe }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const fullUrl = audioUrl.startsWith("http")
    ? audioUrl
    : `${API_URL}${audioUrl}`;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playSound() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );
      setSound(newSound);
      setIsPlaying(true);
    }
  }

  const onPlaybackStatusUpdate = (
    status: import("expo-av").AVPlaybackStatus,
  ) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View className="flex-row items-center py-[8px] px-[4px] min-w-[180px]">
      <TouchableOpacity
        onPress={playSound}
        className="w-[36px] h-[36px] rounded-[18px] items-center justify-center mr-[10px]"
        style={
          isMe
            ? { backgroundColor: "rgba(15, 35, 24, 0.1)" }
            : { backgroundColor: "rgba(110, 231, 183, 0.1)" }
        }
      >
        {isPlaying ? (
          <Pause
            size={20}
            color={isMe ? "#0F2318" : "#6EE7B7"}
            fill={isMe ? "#0F2318" : "transparent"}
          />
        ) : (
          <Play
            size={20}
            color={isMe ? "#0F2318" : "#6EE7B7"}
            fill={isMe ? "#0F2318" : "transparent"}
          />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <View className="h-[4px] bg-black/10 rounded-[2px] mb-[4px]">
          <View
            className="h-full rounded-[2px]"
            style={[
              {
                width: duration > 0 ? `${(position / duration) * 100}%` : "0%",
              },
              isMe
                ? { backgroundColor: "#0F2318" }
                : { backgroundColor: "#6EE7B7" },
            ]}
          />
        </View>
        <Text
          className="text-[10px]"
          style={[
            { fontFamily: "Lexend_400Regular" },
            isMe ? { color: "rgba(15, 35, 24, 0.6)" } : { color: "#94A3B8" },
          ]}
        >
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

function TypingBubble({ photo }: { photo: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ]),
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  return (
    <View
      style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 6 }}
    >
      <Image
        source={{ uri: photo }}
        className="w-[30px] h-[30px] rounded-[15px] mr-[8px] border-[1.5px] border-white/10"
      />
      <View
        className="px-[14px] py-[12px] rounded-[18px] border border-white/5 flex-row items-center justify-center gap-[4px] bg-[#141B27]"
        style={{ borderTopLeftRadius: 4, height: 38 }}
      >
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={{
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: "#6EE7B7",
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            }}
          />
        ))}
      </View>
    </View>
  );
}

function MessageBubble({
  item,
  isMe,
  index,
  onLongPress,
  onPress,
  isSelected,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isMe ? 30 : -30)).current;

  const isLocation = item.content?.startsWith("📍 Location:");
  const latLngString = isLocation
    ? item.content.replace("📍 Location:", "").trim()
    : "";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  let callData: any = null;
  if (item.type === "call") {
    try {
      callData = JSON.parse(item.content);
    } catch (e) {
      callData = { status: "ended", duration: 0 };
    }
  }

  const handleOpenMap = () => {
    if (!latLngString) return;
    const [lat, lng] = latLngString.split(",");
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${lat},${lng}`
        : `geo:0,0?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay: Math.min(index * 20, 300),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        delay: Math.min(index * 20, 300),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{
        backgroundColor: isSelected ? "rgba(0, 168, 132, 0.2)" : "transparent",
        width: "100%",
        marginBottom: 6,
      }}
    >
      <Animated.View
        style={{
          flexDirection: isMe ? "row-reverse" : "row",
          alignItems: "flex-end",
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
          paddingHorizontal: 8,
        }}
      >
        {!isMe && (
          <Image
            source={{
              uri: item.sender?.photo || "https://via.placeholder.com/36",
            }}
            className="w-[30px] h-[30px] rounded-[15px] mr-[8px] border-[1.5px] border-white/10"
          />
        )}

        <View
          style={{
            alignItems: isMe ? "flex-end" : "flex-start",
            maxWidth: "75%",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={onLongPress}
            onPress={onPress}
            className="max-w-[100%]"
            style={
              isMe ? { alignItems: "flex-end" } : { alignItems: "flex-start" }
            }
          >
            <View
              className={
                item.type === "image" && item.imageUrl
                  ? "p-[3px] rounded-[18px]"
                  : "px-[14px] py-[10px] rounded-[18px]"
              }
              style={
                isMe
                  ? { backgroundColor: "#6EE7B7", borderTopRightRadius: 4 }
                  : {
                      backgroundColor: "#141B27",
                      borderTopLeftRadius: 4,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.07)",
                    }
              }
            >
              {item.type === "call" && callData ? (
                <View className="flex-row items-center">
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        callData.status === "missed"
                          ? isMe
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(239, 68, 68, 0.15)"
                          : isMe
                            ? "rgba(15, 35, 24, 0.1)"
                            : "rgba(110, 231, 183, 0.1)",
                    }}
                  >
                    <Phone
                      size={18}
                      color={
                        callData.status === "missed"
                          ? "#EF4444"
                          : isMe
                            ? "#0F2318"
                            : "#6EE7B7"
                      }
                    />
                  </View>
                  <View className="ml-3 mr-2">
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Lexend_500Medium",
                        color:
                          callData.status === "missed"
                            ? "#EF4444"
                            : isMe
                              ? "#0F2318"
                              : "#CBD5E1",
                      }}
                    >
                      {callData.status === "missed"
                        ? t("chat.missedCall", "Missed Call")
                        : t("chat.callEnded", "Call Ended")}
                    </Text>
                    {callData.status === "ended" && (
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "Lexend_400Regular",
                          color: isMe ? "rgba(15, 35, 24, 0.6)" : "#94A3B8",
                        }}
                      >
                        {Math.floor(callData.duration / 60)}:
                        {String(callData.duration % 60).padStart(2, "0")}
                      </Text>
                    )}
                  </View>
                </View>
              ) : item.type === "image" && item.imageUrl ? (
                <TouchableOpacity
                  onPress={() => setSelectedImage(item.imageUrl ?? null)}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{
                      width: 220,
                      height: 220,
                      borderRadius: 15,
                      borderTopRightRadius: isMe ? 2 : 15,
                      borderTopLeftRadius: !isMe ? 2 : 15,
                    }}
                  />
                </TouchableOpacity>
              ) : item.type === "audio" && item.audioUrl ? (
                <AudioPlayer audioUrl={item.audioUrl} isMe={isMe} />
              ) : isLocation ? (
                <View className="rounded-[14px] overflow-hidden">
                  <Map
                    style={{ width: 220, height: 150 }}
                    mapStyle="https://demotiles.maplibre.org/style.json"
                    scrollEnabled={false}
                    zoomEnabled={false}
                    compassEnabled={false}
                    logoEnabled={false}
                  >
                    <Camera
                      initialViewState={{
                        center: [
                          parseFloat(latLngString.split(",")[1]),
                          parseFloat(latLngString.split(",")[0]),
                        ],
                        zoom: 14,
                      }}
                    />
                    <PointAnnotation
                      id={`marker-${item.id}`}
                      coordinate={[
                        parseFloat(latLngString.split(",")[1]),
                        parseFloat(latLngString.split(",")[0]),
                      ]}
                    >
                      <View className="bg-white rounded-[12px] p-[4px]">
                        <MapPinned size={20} color="#EF4444" />
                      </View>
                    </PointAnnotation>
                  </Map>

                  <TouchableOpacity
                    onPress={handleOpenMap}
                    className="absolute bottom-[6px] left-[6px] bg-black/60 px-[8px] py-[4px] rounded-[8px]"
                  >
                    <Text className="text-white text-[11px]">
                      {t("chat.openInMaps")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  className="text-[15px] leading-[22px]"
                  style={
                    isMe
                      ? { color: "#0F2318", fontFamily: "Lexend_500Medium" }
                      : { color: "#CBD5E1", fontFamily: "Lexend_400Regular" }
                  }
                >
                  {item.content}
                </Text>
              )}
            </View>
            <View
              className="flex-row items-center"
              style={{ justifyContent: isMe ? "flex-end" : "flex-start" }}
            >
              <Text
                className="text-[10px] mt-[4px] tracking-[0.3px]"
                style={[
                  { fontFamily: "Lexend_400Regular" },
                  isMe
                    ? { color: "rgba(110, 231, 183, 0.5)", textAlign: "right" }
                    : { color: "#475569" },
                ]}
              >
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {item.reactions && item.reactions.length > 0 && (
                <View className="flex-row mt-[-6px] ml-[4px] z-10">
                  {item.reactions.map((r: any, idx: number) => (
                    <View
                      key={idx}
                      className="bg-[#1E293B] rounded-[12px] border border-[#334155] px-[4px] py-[2px] mx-[1px]"
                    >
                      <Text className="text-[12px]">{r.emoji}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Image Modal */}
        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)" }}>
            {/* Glassmorphism Background */}
            <BlurView
              intensity={40}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
              {/* Header Pro */}
              <View className="flex-row items-center px-4 pt-4 pb-4 z-50 bg-black/20">
                <TouchableOpacity
                  onPress={() => setSelectedImage(null)}
                  className="w-10 h-10 items-center justify-center mr-2 rounded-full active:bg-white/10"
                >
                  <ArrowLeft size={24} color="#E2E8F0" />
                </TouchableOpacity>

                <Image
                  source={{
                    uri: item.sender?.photo || "https://via.placeholder.com/42",
                  }}
                  className="w-[42px] h-[42px] rounded-full border border-white/20 mr-3"
                />

                <View className="flex-1 justify-center">
                  <Text
                    className="text-white text-[16px] tracking-wide"
                    style={{ fontFamily: "Lexend_600SemiBold" }}
                  >
                    {isMe ? t("chat.you", "You") : item.sender?.name || "User"}
                  </Text>
                  <Text
                    className="text-white/60 text-[12px] mt-0.5 tracking-wider"
                    style={{ fontFamily: "Lexend_400Regular" }}
                  >
                    {new Date(item.createdAt).toLocaleString([], {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              {/* Image Container */}
              <View className="flex-1 justify-center items-center px-2 pb-4">
                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    resizeMode="contain"
                  />
                )}
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </Animated.View>
    </View>
  );
}

export default function ViewMessageUse() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<any>();
  const typedParams = params as unknown as MessageDetailParams;
  const conversationId = Number(typedParams.conversationId);
  const otherUserId = Number(typedParams.otherUserId);
  const [ShowMessageMenu, setShowMessageMenu] = useState(false);
  const user = useAuthStore((state: AuthState) => state.user);

  const { resetUnreadCount } = useChatStore();
  const myId = user?.id;
  const queryClient = useQueryClient();

  // ─── WebRTC Call ────────────────────────────────
  const { callState, initiateCall } = useWebRTCContext();
  const isValidId = !isNaN(conversationId) && conversationId > 0;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [textMessage, setTextMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);
  const [showMenu, setShowMenu] = useState(false);

  const { pickImage } = useImagePermission();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  useEffect(() => {
    console.log("Selection changed", selectedMessages);
  }, [selectedMessages]);

  const isSelectionMode = selectedMessages.length > 0;

  // useEffect(() => {
  //   setShowMessageMenu(selectedMessages.length > 0);
  // }, [selectedMessages]);

  const copyMessage = (text: string) => {
    console.log("the copie message", text);

    Clipboard.setString(text);
  };

  const addReactionMutation = useMutation({
    mutationFn: addReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      setSelectedMessageId(null);
    },
  });

  const handleReactionSelect = (emoji: string) => {
    if (selectedMessageId) {
      addReactionMutation.mutate({ messageId: selectedMessageId, emoji });
    }
  };

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    if (isValidId) {
      resetUnreadCount(conversationId);
      markSeen(Number(user?.id), conversationId);
    }
  }, [isValidId, conversationId, user?.id, user?.name]);

  const {
    data: chatData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: isValidId,
  });

  const rawMessages = chatData?.Messages || [];
  const conversationData = chatData?.conversation;

  const messagesToDisplay: Message[] = [...rawMessages]
    .reverse()
    .map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.userId || msg.senderId,
      conversationId: msg.conversationId,
      createdAt: msg.createdAt,
      sender: msg.sender,
      audioUrl: msg.audioUrl,
      imageUrl: msg.imageUrl,
      type: msg.type,
      reactions: msg.reactions || msg.Reactions || [],
    }));

  const selectedMessage = messagesToDisplay.find(
    (msg) => msg.id === selectedMessageId,
  );

  // console.log("selectedMessageId:", selectedMessageId);
  // console.log("selectedMessage:", selectedMessage);

  const [fetchedOtherUser, setFetchedOtherUser] = useState<
    import("../types/user").User | null
  >(null);

  const otherUser = conversationData
    ? String(conversationData.user1?.id) === String(myId)
      ? conversationData.user2
      : conversationData.user1
    : messagesToDisplay.find(
        (m: Message) => String(m.sender?.id || m.senderId) !== String(myId),
      )?.sender ||
      fetchedOtherUser || {
        id: otherUserId,
        name: (params.otherUserName as string) || "User",
        photo: (params.otherUserPhoto as string) || "",
      };

  useEffect(() => {
    if (otherUser && (otherUser as any).isOnline !== undefined) {
      setIsOtherUserOnline(!!(otherUser as any).isOnline);
      setOtherUserLastSeen((otherUser as any).lastSeen || null);
    }
  }, [otherUser]);

  useEffect(() => {
    if (!otherUser?.name || otherUser.name === "User") {
      if (otherUserId && !isNaN(otherUserId)) {
        getUser(otherUserId)
          .then((res) => {
            setFetchedOtherUser(res);
            if (res && (res as any).isOnline !== undefined) {
              setIsOtherUserOnline(!!(res as any).isOnline);
              setOtherUserLastSeen((res as any).lastSeen || null);
            }
          })
          .catch(console.error);
      }
    }
  }, [otherUserId, otherUser?.name]);

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<string | null>(
    null,
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = SocketService.getInstance().getSocket();
    socket.emit("user_online", myId);
    return () => {
      socket.emit("user_offline", myId);
    };
  }, [myId]);

  useEffect(() => {
    const socket = SocketService.getInstance().getSocket();

    const handleReceiveMessage = (message: Message) => {
      if (String(message.conversationId) === String(conversationId)) {
        refetch();
        setIsOtherUserTyping(false);
      }
    };

    const handleUserTyping = (data: {
      conversationId: number;
      userId: number;
      isTyping: boolean;
    }) => {
      if (
        String(data.conversationId) === String(conversationId) &&
        String(data.userId) === String(otherUserId)
      ) {
        setIsOtherUserTyping(data.isTyping);
      }
    };

    const handleUserStatus = (data: {
      userId: string | number;
      isOnline: boolean;
      lastSeen?: string;
    }) => {
      if (String(data.userId) === String(otherUserId)) {
        setIsOtherUserOnline(data.isOnline);
        if (!data.isOnline && data.lastSeen) {
          setOtherUserLastSeen(data.lastSeen);
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_status", handleUserStatus);
    };
  }, [conversationId, otherUserId, refetch]);

  const handleTextChange = (text: string) => {
    setTextMessage(text);

    const socket = SocketService.getInstance().getSocket();

    socket.emit("typing_start", {
      conversationId,
      userId: myId,
      receiverId: otherUserId,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        conversationId,
        userId: myId,
        receiverId: otherUserId,
      });
    }, 2000);
  };

  const requestPermission = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      alert(t("chat.micPermissionRequired"));
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert(t("chat.micPermissionRequired"));
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
    } catch (err) {
      console.log("Error starting recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const formData = new FormData();
        formData.append("audio", {
          uri: uri,
          type: "audio/m4a",
          name: `voice-${Date.now()}.m4a`,
        } as any);
        formData.append("receiverId", String(otherUserId));
        formData.append("conversationId", String(conversationId));
        formData.append("senderId", String(myId));

        await uploadAudioMessage(formData);
        refetch();
      }
    } catch (error) {
      console.error("Error stopping or uploading recording", error);
      alert(t("chat.voiceMessageFailed"));
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!textMessage.trim() || isSending) return;
    setIsSending(true);
    const trimmedMessage = textMessage.trim();
    const messageData = {
      conversationId,
      content: trimmedMessage,
      senderId: myId!,
      receiverId: otherUserId,
    };

    setTextMessage("");
    try {
      await createConversation(messageData);
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [textMessage, myId, otherUserId, conversationId, isSending, refetch]);

  const handleSendLocationMessage = async () => {
    setShowMenu(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(t("chat.locationPermissionDenied"));
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      const messageData = {
        conversationId,
        content: `📍 Location:${lat},${lng}`,
        senderId: myId!,
        receiverId: otherUserId,
      };

      await createConversation(messageData);
      refetch();
    } catch (error) {
      console.error("Error sending location:", error);
      alert(t("chat.locationFailed"));
    }
  };

  if (!isValidId && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#080C14" }}>
        <View className="flex-row items-center px-[16px] py-[14px] bg-[#080C14]/95">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-[38px] h-[38px] rounded-[12px] bg-white/5 items-center justify-center border border-white/5"
          >
            <ArrowLeft size={20} color="#E2E8F0" />
          </TouchableOpacity>
          <Text
            className="text-[#F1F5F9] text-[16px] tracking-[0.2px] ml-[12px]"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            Chat
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text
            className="text-[#94A3B8] text-[16px] tracking-[0.3px]"
            style={{ fontFamily: "Lexend_600SemiBold" }}
          >
            {t("chat.invalidConversation")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#080C14" }}>
        <View className="flex-row items-center px-[16px] py-[14px] bg-[#080C14]/95">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-[38px] h-[38px] rounded-[12px] bg-white/5 items-center justify-center border border-white/5"
          >
            <ArrowLeft size={20} color="#E2E8F0" />
          </TouchableOpacity>
          <View className="flex-1 h-[18px] rounded-[6px] bg-white/5 ml-[12px]" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6EE7B7" />
          <Text
            className="text-[#475569] mt-[12px] text-[14px] tracking-[0.3px]"
            style={{ fontFamily: "Lexend_400Regular" }}
          >
            {t("chat.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleImageUpload = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: uri,
        type: "image/jpeg",
        name: `image-${Date.now()}.jpg`,
      } as any);
      formData.append("receiverId", String(otherUserId));
      formData.append("conversationId", String(conversationId));
      formData.append("senderId", String(myId));

      await uploadImageMessage(formData);
      refetch();
    } catch (error) {
      console.error("Error uploading image", error);
      alert(t("chat.imageUploadFailed") || "Failed to send image");
    }
  };

  const OnpickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setSelfieUri(uri);
      await handleImageUpload(uri);
    }
  };

  const OntakePhoto = async () => {
    setIsCameraVisible(true);
  };

  const formatLastSeen = (dateString: string | null) => {
    if (!dateString) return "Offline";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("chat.justNow", "Just now");

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return t("chat.minsAgo", {
        count: diffInMinutes,
        defaultValue: `Last seen ${diffInMinutes}m ago`,
      });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return t("chat.hoursAgo", {
        count: diffInHours,
        defaultValue: `Last seen ${diffInHours}h ago`,
      });

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t("chat.yesterday", "Last seen yesterday");
    if (diffInDays < 7)
      return t("chat.daysAgo", {
        count: diffInDays,
        defaultValue: `Last seen ${diffInDays}d ago`,
      });

    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#080C14" }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.View
          className="flex-row items-center px-[16px] py-[14px] bg-[#080C14]/95"
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          }}
        >
          {ShowMessageMenu ? (
            <View className="flex-row items-center justify-between flex-1">
              <TouchableOpacity
                className="flex-row items-center gap-3"
                onPress={() => {
                  setShowMessageMenu(false);
                  setSelectedMessages([]);
                }}
              >
                <ArrowLeft size={22} color="#E2E8F0" />
                <Text
                  style={{
                    fontFamily: "Lexend_600SemiBold",
                    fontSize: 18,
                    color: "#E2E8F0",
                  }}
                >
                  {selectedMessages.length}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center gap-5">
                <TouchableOpacity
                  className="w-[38px] h-[38px] rounded-[12px] items-center justify-center"
                  onPress={() => copyMessage(selectedMessage?.content ?? "")}
                >
                  <Copy size={22} color="#E2E8F0" />
                </TouchableOpacity>

                <TouchableOpacity className="w-[38px] h-[38px] rounded-[12px] items-center justify-center">
                  <Trash2 size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-[38px] h-[38px] rounded-[12px] bg-white/5 items-center justify-center border border-white/5"
              >
                <ArrowLeft size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <View className="flex-1 flex-row items-center ml-[12px]">
                <View className="relative mr-[11px]">
                  <Image
                    source={{
                      uri: otherUser?.photo || "https://via.placeholder.com/42",
                    }}
                    className="w-[42px] h-[42px] rounded-[21px] border-2 border-[#6EE7B7]/30"
                  />
                  {isOtherUserOnline && (
                    <View className="absolute bottom-[1px] right-[1px] w-[10px] h-[10px] rounded-[5px] bg-[#6EE7B7] border-2 border-[#080C14]" />
                  )}
                </View>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      className="text-[#F1F5F9] text-[16px] tracking-[0.2px]"
                      style={{ fontFamily: "Lexend_700Bold" }}
                    >
                      {otherUser?.name || "Conversation"}
                    </Text>
                    {otherUser?.verified && (
                      <BadgeCheck
                        size={18}
                        color="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.1}
                      />
                    )}
                  </View>
                  <Text
                    className={`text-[11px] mt-[2px] tracking-[0.5px] ${isOtherUserOnline || isOtherUserTyping ? "text-[#6EE7B7]" : "text-[#94A3B8]"}`}
                    style={{ fontFamily: "Lexend_500Medium" }}
                  >
                    {isOtherUserTyping
                      ? t("chat.typing")
                      : isOtherUserOnline
                        ? `● ${t("chat.online")}`
                        : formatLastSeen(otherUserLastSeen)}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-[8px]">
                <TouchableOpacity
                  className="w-[38px] h-[38px] rounded-[12px] bg-white/5 items-center justify-center border border-white/5"
                  onPress={() =>
                    initiateCall({
                      targetUserId: otherUser?.id || otherUserId,
                      targetName:
                        otherUser?.name || (params.otherUserName as string),
                      targetPhoto:
                        otherUser?.photo || (params.otherUserPhoto as string),
                      callerName: user?.name || "Me",
                      callerPhoto: user?.photo,
                    })
                  }
                >
                  <Phone size={18} color="#6EE7B7" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>

        <View className="h-[1px] bg-white/5 mx-0" />

        <FlatList
          ref={flatListRef}
          data={messagesToDisplay}
          inverted
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 8, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          renderItem={({ item, index }) => {
            const isMe =
              String(item.sender?.id || item.senderId) === String(myId);

            const isSelected = selectedMessages.includes(item.id);

            return (
              <MessageBubble
                item={item}
                isMe={isMe}
                isSelected={isSelected}
                index={index}
                onPress={() => {
                  if (!isSelectionMode) {
                    return;
                  }

                  setSelectedMessages((prev) => {
                    const next = prev.includes(item.id)
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id];

                    if (next.length === 0) {
                      setShowMessageMenu(false);
                      setSelectedMessageId(null);
                    }

                    return next;
                  });
                }}
                onLongPress={() => {
                  if (isSelectionMode) return;

                  setSelectedMessages([item.id]);
                  setSelectedMessageId(item.id);
                  setShowMessageMenu(true);
                }}
              />
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center pt-[100px]">
              <View className="w-[64px] h-[64px] rounded-[32px] bg-[#6EE7B7]/10 border border-[#6EE7B7]/20 items-center justify-center mb-[16px]">
                <Send size={24} color="#6EE7B7" />
              </View>
              <Text
                className="text-[#94A3B8] text-[16px] tracking-[0.3px]"
                style={{ fontFamily: "Lexend_600SemiBold" }}
              >
                {t("chat.noMessages")}
              </Text>
              <Text
                className="text-[#475569] text-[14px] mt-[6px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                {t("chat.sayHello")}
              </Text>
            </View>
          }
          ListHeaderComponent={
            isOtherUserTyping ? (
              <TypingBubble
                photo={
                  otherUser?.photo || (params.otherUserPhoto as string) || ""
                }
              />
            ) : null
          }
        />

        <View style={{ position: "relative" }}>
          <View
            className="flex-row items-end px-[14px] pt-[12px] bg-[#080C14]/98 border-t border-white/5 gap-[10px]"
            style={{ paddingBottom: Platform.OS === "ios" ? 12 : 14 }}
          >
            <View className="flex-1 bg-[#111827] rounded-[22px] border border-[#6EE7B7]/15 overflow-hidden">
              <TextInput
                placeholder={t("chat.placeholder")}
                placeholderTextColor="#475569"
                className="px-[18px] py-[10px] text-[#E2E8F0] text-[15px] max-h-[120px]"
                style={[
                  {
                    fontFamily: "Lexend_400Regular",
                    height: Math.min(Math.max(40, inputHeight), 120),
                  },
                ]}
                value={textMessage}
                onChangeText={handleTextChange}
                onFocus={() => setShowMenu(false)}
                multiline
                onContentSizeChange={(e) =>
                  setInputHeight(e.nativeEvent.contentSize.height)
                }
              />
            </View>

            <TouchableOpacity
              className="w-[44px] h-[44px] rounded-[22px] items-center justify-center border"
              style={[
                showMenu
                  ? {
                      backgroundColor: "rgba(110, 231, 183, 0.15)",
                      borderColor: "rgba(110, 231, 183, 0.5)",
                    }
                  : {
                      backgroundColor: "#141B27",
                      borderColor: "rgba(110, 231, 183, 0.25)",
                    },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (showMenu) {
                  setShowMenu(false);
                } else {
                  Keyboard.dismiss();
                  setTimeout(() => setShowMenu(true), 50);
                }
              }}
            >
              <Paperclip size={20} color="#6EE7B7" />
            </TouchableOpacity>

            {textMessage.trim().length === 0 ? (
              <TouchableOpacity
                className="w-[44px] h-[44px] rounded-[22px] items-center justify-center border"
                style={[
                  recording
                    ? {
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        borderColor: "#EF4444",
                      }
                    : {
                        backgroundColor: "#141B27",
                        borderColor: "rgba(110, 231, 183, 0.25)",
                      },
                ]}
                activeOpacity={0.7}
                onPress={recording ? stopRecording : startRecording}
              >
                <Mic size={20} color={recording ? "#EF4444" : "#6EE7B7"} />
              </TouchableOpacity>
            ) : (
              <AnimatedSendButton
                onPress={handleSendMessage}
                disabled={isSending}
                isPending={isSending}
                hasText={!!textMessage.trim()}
              />
            )}
          </View>
          {/* WhatsApp-like Bottom Attachment Menu */}
          {showMenu && (
            <View className="bg-[#080C14] px-[24px] py-[24px] flex-row justify-around border-t border-white/5">
              <TouchableOpacity
                className="items-center"
                activeOpacity={0.7}
                onPress={handleSendLocationMessage}
              >
                <View className="w-[56px] h-[56px] rounded-[28px] bg-[#3B82F6]/15 items-center justify-center mb-[8px] border border-[#3B82F6]/30">
                  <MapPinned size={24} color="#3B82F6" />
                </View>
                <Text
                  className="text-[#E2E8F0] text-[12px]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                >
                  {t("chat.sendLocation")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenu(false);
                  OnpickImage();
                }}
              >
                <View className="w-[56px] h-[56px] rounded-[28px] bg-[#8B5CF6]/15 items-center justify-center mb-[8px] border border-[#8B5CF6]/30">
                  <ImageIcon size={24} color="#8B5CF6" />
                </View>
                <Text
                  className="text-[#E2E8F0] text-[12px]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                >
                  {t("chat.pickImage")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                activeOpacity={0.7}
                onPress={() => {
                  setShowMenu(false);
                  OntakePhoto();
                }}
              >
                <View className="w-[56px] h-[56px] rounded-[28px] bg-[#EF4444]/15 items-center justify-center mb-[8px] border border-[#EF4444]/30">
                  <CameraIcon size={24} color="#EF4444" />
                </View>
                <Text
                  className="text-[#E2E8F0] text-[12px]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                >
                  {t("chat.takePhoto")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* <Modal
        transparent
        visible={!!selectedMessageId}
        animationType="fade"
        onRequestClose={() => setSelectedMessageId(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setSelectedMessageId(null)}
        >
          <View
            className="flex-row bg-[#1E293B] p-[12px] rounded-[24px] border border-[#334155]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                className="mx-[8px]"
                onPress={() => handleReactionSelect(emoji)}
              >
                <Text className="text-[28px]">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal> */}

      <Modal
        visible={isCameraVisible}
        animationType="slide"
        onRequestClose={() => setIsCameraVisible(false)}
      >
        <CameraScreenSignUp
          onClose={() => setIsCameraVisible(false)}
          onPhotoTaken={(uri) => {
            setSelfieUri(uri);
            handleImageUpload(uri);
            setIsCameraVisible(false);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}
