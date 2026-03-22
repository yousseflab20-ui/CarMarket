import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform, KeyboardAvoidingView, Modal, Image, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send, BadgeCheck, Mic, Play, Pause, Phone, Video } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation, getMessages, markSeen, uploadAudioMessage, addReaction } from "../service/chat/endpoint.message";
import { getUser } from "../service/endpointService";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { router, useLocalSearchParams } from "expo-router";
import SocketService from "../service/SocketService";
import { Audio } from "expo-av";
import API_URL from "../constant/URL";
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';

function CallErrorModal({ visible, title, message, onClose }: {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            scaleAnim.setValue(0.85);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    return (
        <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
            <View style={callModalStyles.overlay}>
                <Animated.View style={[callModalStyles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={callModalStyles.iconCircle}>
                        <Text style={callModalStyles.iconEmoji}>📵</Text>
                    </View>
                    <Text style={callModalStyles.title}>{title}</Text>
                    <Text style={callModalStyles.message}>{message}</Text>
                    <TouchableOpacity style={callModalStyles.button} onPress={onClose} activeOpacity={0.8}>
                        <Text style={callModalStyles.buttonText}>Got it</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const callModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        backgroundColor: '#141B27',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(110,231,183,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    iconEmoji: {
        fontSize: 28,
    },
    title: {
        color: '#F1F5F9',
        fontSize: 18,
        fontFamily: 'Lexend_700Bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        color: '#94A3B8',
        fontSize: 14,
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        width: '100%',
        backgroundColor: '#6EE7B7',
        paddingVertical: 13,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#0A1628',
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        letterSpacing: 0.3,
    },
});

function AnimatedSendButton({ onPress, disabled, isPending, hasText }: {
    onPress: () => void;
    disabled: boolean;
    isPending: boolean;
    hasText: boolean;
}) {
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
        }))
    ).current;

    const triggerAnimation = () => {
        if (disabled) return;

        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.82, tension: 300, friction: 10, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1.1, tension: 200, friction: 8, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        ]).start();

        Animated.sequence([
            Animated.timing(iconSlide, { toValue: -7, duration: 80, useNativeDriver: true }),
            Animated.timing(iconSlide, { toValue: 0, duration: 130, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
        ]).start();

        rippleAnim.setValue(0);
        rippleOpacity.setValue(0.7);
        Animated.parallel([
            Animated.timing(rippleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        const angles = [0, 60, 120, 180, 240, 300];
        particles.forEach((p, i) => {
            const angle = (angles[i] * Math.PI) / 180;
            const distance = 28 + Math.random() * 14;
            p.x.setValue(0); p.y.setValue(0); p.opacity.setValue(1); p.scale.setValue(0.5);
            Animated.parallel([
                Animated.timing(p.x, { toValue: Math.cos(angle) * distance, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(p.y, { toValue: Math.sin(angle) * distance, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(p.scale, { toValue: 1, duration: 100, useNativeDriver: true }),
                    Animated.timing(p.scale, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.delay(100),
                    Animated.timing(p.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]),
            ]).start();
        });

        onPress();
    };

    useEffect(() => {
        // requestPermission(); // Moved to ViewMessageUse
    }, []);

    const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] });

    return (
        <View style={sbStyles.wrapper}>
            <Animated.View style={[sbStyles.ripple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />

            {particles.map((p, i) => (
                <Animated.View key={i} style={[sbStyles.particle, { opacity: p.opacity, transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }] }]} />
            ))}

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[sbStyles.button, !hasText && sbStyles.buttonDisabled]}
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

const sbStyles = StyleSheet.create({
    wrapper: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    ripple: {
        position: "absolute", width: 44, height: 44, borderRadius: 22,
        borderWidth: 2, borderColor: "#6EE7B7",
    },
    particle: {
        position: "absolute", width: 6, height: 6, borderRadius: 3,
        backgroundColor: "#6EE7B7",
    },
    button: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: "#141B27",
        alignItems: "center", justifyContent: "center",
        borderWidth: 1, borderColor: "rgba(110, 231, 183, 0.25)",
        shadowOpacity: 0, elevation: 0,
    },
    buttonDisabled: {
        backgroundColor: "#141B27", shadowOpacity: 0, elevation: 0,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    },
});

interface Message {
    id: number;
    content: string;
    senderId: any;
    conversationId: number;
    createdAt: string;
    audioUrl?: string;
    type?: "text" | "audio";
    sender?: {
        id: number;
        name: string;
        photo: string;
    };
    reactions?: { emoji: string; userId: number }[];
}

function AudioPlayer({ audioUrl, isMe }: { audioUrl: string; isMe: boolean }) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const fullUrl = audioUrl.startsWith("http") ? audioUrl : `${API_URL}${audioUrl}`;

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
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setIsPlaying(true);
        }
    }

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
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
        <View style={audioStyles.container}>
            <TouchableOpacity onPress={playSound} style={[audioStyles.playButton, isMe && audioStyles.playButtonMe]}>
                {isPlaying ? (
                    <Pause size={20} color={isMe ? "#0F2318" : "#6EE7B7"} fill={isMe ? "#0F2318" : "transparent"} />
                ) : (
                    <Play size={20} color={isMe ? "#0F2318" : "#6EE7B7"} fill={isMe ? "#0F2318" : "transparent"} />
                )}
            </TouchableOpacity>
            <View style={audioStyles.progressContainer}>
                <View style={audioStyles.progressBar}>
                    <View
                        style={[
                            audioStyles.progressFill,
                            { width: duration > 0 ? `${(position / duration) * 100}%` : "0%" },
                            isMe && audioStyles.progressFillMe
                        ]}
                    />
                </View>
                <Text style={[audioStyles.timeText, isMe && audioStyles.timeTextMe]}>
                    {formatTime(position)} / {formatTime(duration)}
                </Text>
            </View>
        </View>
    );
}

const audioStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
        minWidth: 180,
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(110, 231, 183, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    playButtonMe: {
        backgroundColor: "rgba(15, 35, 24, 0.1)",
    },
    progressContainer: {
        flex: 1,
    },
    progressBar: {
        height: 4,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
        marginBottom: 4,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#6EE7B7",
        borderRadius: 2,
    },
    progressFillMe: {
        backgroundColor: "#0F2318",
    },
    timeText: {
        fontSize: 10,
        color: "#94A3B8",
        fontFamily: "Lexend_400Regular",
    },
    timeTextMe: {
        color: "rgba(15, 35, 24, 0.6)",
    }
});

function MessageBubble({ item, isMe, index, onLongPress }: { item: Message; isMe: boolean; index: number; onLongPress: () => void }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(isMe ? 30 : -30)).current;

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
        <Animated.View
            style={{
                flexDirection: isMe ? "row-reverse" : "row",
                alignItems: "flex-end",
                marginBottom: 6,
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
            }}
        >
            {!isMe && (
                <Image
                    source={{ uri: item.sender?.photo || "https://via.placeholder.com/36" }}
                    style={styles.avatarSmall}
                />
            )}

            <View style={{ alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                <TouchableOpacity 
                    activeOpacity={0.8}
                    onLongPress={onLongPress}
                    style={[styles.bubbleWrapper, isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperThem, { maxWidth: "100%" }]}
                >
                    <View style={[styles.messageBubble, isMe ? styles.rightBubble : styles.leftBubble]}>
                        {item.type === "audio" && item.audioUrl ? (
                            <AudioPlayer audioUrl={item.audioUrl} isMe={isMe} />
                        ) : (
                            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                                {item.content}
                            </Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isMe ? "flex-end" : "flex-start" }}>
                        <Text style={[styles.time, isMe ? styles.timeMe : styles.timeThem]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                        {item.reactions && item.reactions.length > 0 && (
                            <View style={styles.reactionsContainer}>
                                {item.reactions.map((r: any, idx: number) => (
                                    <View key={idx} style={styles.reactionBadge}>
                                        <Text style={styles.reactionBadgeText}>{r.emoji}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

export default function ViewMessageUse() {
    const params = useLocalSearchParams();
    const conversationId = Number(params.conversationId);
    const otherUserId = Number(params.otherUserId);
    const user = useAuthStore((state) => state.user);
    const { resetUnreadCount } = useChatStore();
    const myId = user?.id;
    const queryClient = useQueryClient();
    const isValidId = !isNaN(conversationId) && conversationId > 0;

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [textMessage, setTextMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const [callError, setCallError] = useState<{ title: string; message: string } | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const addReactionMutation = useMutation({
        mutationFn: addReaction,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
             setSelectedMessageId(null);
        }
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

    const { data: chatData, isLoading, refetch } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => getMessages(conversationId),
        enabled: isValidId,
    });

    const rawMessages = chatData?.Messages || [];
    const conversationData = chatData?.conversation;

    const messagesToDisplay = [...rawMessages].reverse().map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.userId || msg.senderId,
        conversationId: msg.conversationId,
        createdAt: msg.createdAt,
        sender: msg.sender,
        audioUrl: msg.audioUrl,
        type: msg.type,
        reactions: msg.reactions || msg.Reactions || [],
    }));

    const [fetchedOtherUser, setFetchedOtherUser] = useState<any>(null);

    const otherUser = conversationData
        ? (String(conversationData.user1?.id) === String(myId) ? conversationData.user2 : conversationData.user1)
        : messagesToDisplay.find(
            (m: Message) => String(m.sender?.id || m.senderId) !== String(myId)
        )?.sender || fetchedOtherUser || {
            id: otherUserId,
            name: (params.otherUserName as string) || "User",
            photo: (params.otherUserPhoto as string) || ""
        };

    useEffect(() => {
        if (!otherUser?.name || otherUser.name === "User") {
            if (otherUserId && !isNaN(otherUserId)) {
                getUser(otherUserId).then(setFetchedOtherUser).catch(console.error);
            }
        }
    }, [otherUserId, otherUser?.name]);

    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();
        socket.emit("user_online", myId);
        return () => { socket.emit("user_offline", myId); };
    }, [myId]);

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();

        const handleReceiveMessage = (message: Message) => {
            if (String(message.conversationId) === String(conversationId)) {
                refetch();
                setIsOtherUserTyping(false);
            }
        };

        const handleUserTyping = (data: { conversationId: number; userId: number; isTyping: boolean }) => {
            if (String(data.conversationId) === String(conversationId) && String(data.userId) === String(otherUserId)) {
                setIsOtherUserTyping(data.isTyping);
            }
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("user_typing", handleUserTyping);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("user_typing", handleUserTyping);
        };
    }, [conversationId, otherUserId, refetch]);

    const handleTextChange = (text: string) => {
        setTextMessage(text);

        const socket = SocketService.getInstance().getSocket();

        socket.emit("typing_start", {
            conversationId,
            userId: myId,
            receiverId: otherUserId
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing_stop", {
                conversationId,
                userId: myId,
                receiverId: otherUserId
            });
        }, 2000);
    };

    const requestPermission = async () => {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
            alert("Microphone permission is required");
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                alert("Microphone permission is required");
                return;
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
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
            alert("Failed to send voice message");
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

    if (!isValidId && !isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={20} color="#E2E8F0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat</Text>
                </View>
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Invalid conversation.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={20} color="#E2E8F0" />
                    </TouchableOpacity>
                    <View style={styles.headerSkeleton} />
                </View>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#6EE7B7" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: headerAnim,
                            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
                        },
                    ]}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={20} color="#CBD5E1" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: otherUser?.photo || "https://via.placeholder.com/42" }}
                                style={styles.headerAvatar}
                            />
                            <View style={styles.onlineDot} />
                        </View>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={styles.headerTitle}>{otherUser?.name || "Conversation"}</Text>
                                {otherUser?.verified && (
                                    <BadgeCheck size={18} color="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                                )}
                            </View>
                            <Text style={styles.headerStatus}>
                                {isOtherUserTyping ? "typing..." : "● online"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        {/* Voice call button */}
                        <TouchableOpacity
                            style={styles.callIconButton}
                            onPress={async () => {
                                try {
                                    await ZegoUIKitPrebuiltCallService.sendCallInvitation(
                                        [{ userID: String(otherUser?.id || otherUserId), userName: String(otherUser?.name || 'User') }],
                                        false,
                                        { navigate: (name: string, params?: any) => router.push({ pathname: name, params }) } as any,
                                        {}
                                    );
                                } catch (e: any) {
                                    const code = e?.code ?? e?.message ?? '';
                                    if (String(code).includes('107026') || String(e?.message).includes('107026')) {
                                        setCallError({ title: 'User Unavailable', message: `${otherUser?.name || 'This user'} is not online right now.\nPlease try again later.` });
                                    } else {
                                        setCallError({ title: 'Call Failed', message: 'Could not connect the call. Please try again.' });
                                    }
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <Phone size={18} color="#6EE7B7" />
                        </TouchableOpacity>

                        {/* Video call button */}
                        <TouchableOpacity
                            style={styles.callIconButton}
                            onPress={async () => {
                                try {
                                    await ZegoUIKitPrebuiltCallService.sendCallInvitation(
                                        [{ userID: String(otherUser?.id || otherUserId), userName: String(otherUser?.name || 'User') }],
                                        true,
                                        { navigate: (name: string, params?: any) => router.push({ pathname: name, params }) } as any,
                                        {}
                                    );
                                } catch (e: any) {
                                    const code = e?.code ?? e?.message ?? '';
                                    if (String(code).includes('107026') || String(e?.message).includes('107026')) {
                                        setCallError({ title: 'User Unavailable', message: `${otherUser?.name || 'This user'} is not online right now.\nPlease try again later.` });
                                    } else {
                                        setCallError({ title: 'Call Failed', message: 'Could not connect the call. Please try again.' });
                                    }
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <Video size={18} color="#6EE7B7" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={styles.headerSeparator} />

                <FlatList
                    ref={flatListRef}
                    data={messagesToDisplay}
                    inverted
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    renderItem={({ item, index }) => {
                        const isMe = String(item.sender?.id || item.senderId) === String(myId);
                        return <MessageBubble item={item} isMe={isMe} index={index} onLongPress={() => setSelectedMessageId(item.id)} />;
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Send size={24} color="#6EE7B7" />
                            </View>
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Say hello 👋</Text>
                        </View>
                    }
                />

                <View style={styles.inputBar}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder="Message..."
                            placeholderTextColor="#475569"
                            style={[styles.input, { height: Math.min(Math.max(40, inputHeight), 120) }]}
                            value={textMessage}
                            onChangeText={handleTextChange}
                            multiline
                            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                        />
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: recording ? "rgba(239, 68, 68, 0.2)" : "#141B27",
                                borderColor: recording ? "#EF4444" : "rgba(110, 231, 183, 0.25)"
                            }
                        ]}
                        activeOpacity={0.7}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <Mic size={20} color={recording ? "#EF4444" : "#6EE7B7"} />
                    </TouchableOpacity>
                    <AnimatedSendButton
                        onPress={handleSendMessage}
                        disabled={!textMessage.trim() || isSending}
                        isPending={isSending}
                        hasText={!!textMessage.trim()}
                    />
                </View>

            </KeyboardAvoidingView>

            <CallErrorModal
                visible={!!callError}
                title={callError?.title ?? ''}
                message={callError?.message ?? ''}
                onClose={() => setCallError(null)}
            />

            <Modal transparent visible={!!selectedMessageId} animationType="fade" onRequestClose={() => setSelectedMessageId(null)}>
                <TouchableOpacity style={styles.reactionModalOverlay} activeOpacity={1} onPress={() => setSelectedMessageId(null)}>
                    <View style={styles.reactionPicker}>
                        {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                            <TouchableOpacity key={emoji} style={styles.reactionEmojiContainer} onPress={() => handleReactionSelect(emoji)}>
                                <Text style={styles.reactionEmojiPicker}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080C14",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "rgba(8, 12, 20, 0.95)",
    },
    headerSeparator: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginHorizontal: 0,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 11,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: "rgba(110, 231, 183, 0.3)",
    },
    onlineDot: {
        position: "absolute",
        bottom: 1,
        right: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#6EE7B7",
        borderWidth: 2,
        borderColor: "#080C14",
    },
    headerTitle: {
        color: "#F1F5F9",
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.2,
    },
    headerStatus: {
        color: "#6EE7B7",
        fontSize: 11,
        marginTop: 2,
        letterSpacing: 0.5,
        fontFamily: "Lexend_500Medium",
    },
    headerSkeleton: {
        flex: 1,
        height: 18,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.06)",
        marginLeft: 12,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    callIconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(110, 231, 183, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.2)",
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },

    listContent: {
        padding: 16,
        paddingBottom: 8,
        flexGrow: 1,
    },

    avatarSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.08)",
    },

    bubbleWrapper: {
        maxWidth: "75%",
    },
    bubbleWrapperMe: {
        alignItems: "flex-end",
    },
    bubbleWrapperThem: {
        alignItems: "flex-start",
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    leftBubble: {
        backgroundColor: "#141B27",
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
    },
    rightBubble: {
        backgroundColor: "#6EE7B7",
        borderTopRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: "Lexend_400Regular",
    },
    messageTextMe: {
        color: "#0F2318",
        fontFamily: "Lexend_500Medium",
    },
    messageTextThem: {
        color: "#CBD5E1",
        fontFamily: "Lexend_400Regular",
    },
    time: {
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 0.3,
        fontFamily: "Lexend_400Regular",
    },
    timeMe: {
        color: "rgba(110, 231, 183, 0.5)",
        textAlign: "right",
        fontFamily: "Lexend_400Regular",
    },
    timeThem: {
        color: "#475569",
        fontFamily: "Lexend_400Regular",
    },

    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 14,
        paddingVertical: 12,
        paddingBottom: Platform.OS === "ios" ? 12 : 14,
        backgroundColor: "rgba(8,12,20,0.98)",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
        gap: 10,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: "#111827",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.15)",
        overflow: "hidden",
    },
    input: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 10,
        color: "#E2E8F0",
        fontSize: 15,
        fontFamily: "Lexend_400Regular",
        maxHeight: 120,
    },

    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(110, 231, 183, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        fontFamily: "Lexend_600SemiBold",
        letterSpacing: 0.3,
    },
    emptySubtext: {
        color: "#475569",
        fontSize: 14,
        marginTop: 6,
        fontFamily: "Lexend_400Regular",
    },
    loadingText: {
        color: "#475569",
        marginTop: 12,
        fontSize: 14,
        letterSpacing: 0.3,
        fontFamily: "Lexend_400Regular",
    },
    reactionsContainer: {
        flexDirection: 'row',
        marginTop: -6,
        marginLeft: 4,
        zIndex: 10,
    },
    reactionBadge: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginHorizontal: 1,
    },
    reactionBadgeText: {
        fontSize: 12,
    },
    reactionModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reactionPicker: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    reactionEmojiContainer: {
        marginHorizontal: 8,
    },
    reactionEmojiPicker: {
        fontSize: 28,
    },
});