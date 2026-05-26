import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

interface CameraScreenSignUpProps {
    onClose: () => void;
    onPhotoTaken: (uri: string) => void;
}

export default function CameraScreenSignUp({
    onClose,
    onPhotoTaken,
}: CameraScreenSignUpProps) {
    const { t } = useTranslation();
    const cameraRef = useRef<CameraView | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cornerAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();

        Animated.timing(fadeAnim, {
            toValue: 1, duration: 600, useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(cornerAnim, { toValue: 0.3, duration: 1600, useNativeDriver: true }),
                Animated.timing(cornerAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const takePhoto = async () => {
        if (!cameraRef.current || isCapturing) return;
        setIsCapturing(true);

        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.88, duration: 90, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
            onPhotoTaken(photo.uri);
        } finally {
            setIsCapturing(false);
        }
    };

    // ── Permission screen ─────────────────────────────────────────────────────
    if (hasPermission === null || hasPermission === false) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-8">
                <View className="w-20 h-20 rounded-full border border-white/20 items-center justify-center mb-6">
                    <Ionicons name="camera-outline" size={34} color="white" />
                </View>
                <Text className="text-white text-base text-center leading-6"
                    style={{ fontFamily: "Lexend_400Regular" }}>
                    {hasPermission === null
                        ? t("camera.requestingPermission")
                        : t("camera.noAccess")}
                </Text>
                {hasPermission === false && (
                    <Text className="text-white/40 text-sm text-center mt-3 leading-5"
                        style={{ fontFamily: "Lexend_400Regular" }}>
                        Please enable camera access in your device settings.
                    </Text>
                )}
            </View>
        );
    }

    // ── Corner brackets ───────────────────────────────────────────────────────
    const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
        const map: Record<string, object> = {
            tl: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 10 },
            tr: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 10 },
            bl: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 10 },
            br: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 10 },
        };
        return (
            <Animated.View
                style={[
                    { position: "absolute", width: 28, height: 28, borderColor: "rgba(167,139,250,0.85)" },
                    map[pos],
                    { opacity: cornerAnim },
                ]}
            />
        );
    };

    // ── Main screen ───────────────────────────────────────────────────────────
    return (
        <View className="flex-1 bg-[#0b0b0f]">

            {/* Camera — locked to front (selfie) */}
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
            />

            {/* Subtle purple vignette centre glow */}
            <View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(11,11,15,0.35)" }]}
            />

            <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>

                {/* ── TOP ROW: close + selfie badge ── */}
                <View className="flex-row items-center justify-between pt-12 px-5">
                    <TouchableOpacity
                        className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 items-center justify-center"
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    {/* Selfie badge */}
                    <View className="flex-row items-center gap-x-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1.5">
                        <View className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <Text
                            className="text-white/70 text-[10px] uppercase tracking-[1.5px]"
                            style={{ fontFamily: "Lexend_500Medium" }}
                        >
                            Selfie
                        </Text>
                    </View>

                    {/* Spacer to keep badge centred */}
                    <View className="w-9" />
                </View>

                <Text
                    className="text-white/25 text-xs text-center mt-2 tracking-wide"
                    style={{ fontFamily: "Lexend_400Regular" }}
                >
                    Front camera · auto-focus
                </Text>

                {/* ── FACE FRAME ── */}
                <View className="flex-1 items-center justify-center">
                    <View style={{ width: 200, height: 240, position: "relative" }}>
                        <Corner pos="tl" />
                        <Corner pos="tr" />
                        <Corner pos="bl" />
                        <Corner pos="br" />

                        {/* Oval guide */}
                        <View className="absolute inset-4 rounded-full border border-dashed border-white/10 items-center justify-center">
                            <Ionicons name="person-outline" size={52} color="rgba(255,255,255,0.06)" />
                        </View>
                    </View>

                    <Text
                        className="text-white/25 text-xs mt-5 tracking-wide"
                        style={{ fontFamily: "Lexend_400Regular" }}
                    >
                        Center your face &amp; hold still
                    </Text>
                </View>

                {/* ── BOTTOM: shutter only ── */}
                <View className="items-center pb-14 gap-y-5">

                    {/* Shutter button */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            onPress={takePhoto}
                            disabled={isCapturing}
                            activeOpacity={0.85}
                            className="w-[76px] h-[76px] rounded-full border-2 border-violet-400/30 items-center justify-center"
                        >
                            {/* outer hint ring */}
                            <View
                                className="absolute -inset-1.5 rounded-full border border-violet-400/10"
                            />
                            <View className="w-[60px] h-[60px] rounded-full bg-white items-center justify-center">
                                <View className="w-12 h-12 rounded-full bg-slate-50 border border-black/[0.04]" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Soft alt action */}
                    <TouchableOpacity className="flex-row items-center gap-x-2 bg-white/[0.04] border border-white/[0.07] rounded-full px-4 py-2">
                        <Ionicons name="images-outline" size={13} color="rgba(255,255,255,0.35)" />
                        <Text
                            className="text-white/40 text-xs tracking-wide"
                            style={{ fontFamily: "Lexend_400Regular" }}
                        >
                            Use existing photo instead
                        </Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>
        </View>
    );
}