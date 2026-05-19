import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    SafeAreaView,
    Platform,
    ImageBackground,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingData } from "./_onboardingData";
import { LinearGradient } from "expo-linear-gradient";
import { OnboardingSlide } from "../../types/screens/onboarding";

const { width, height } = Dimensions.get("window");

export default function OnboardingTakePhoto() {
    const [index, setIndex] = useState(0);
    const flatRef = useRef<FlatList>(null);
    const router = useRouter();
    const setHasCompletedOnboarding = useOnboardingStore(
        (s) => s.setHasCompletedOnboarding,
    );

    const isLast = index === onboardingData.length - 1;

    const handleNext = () => {
        if (isLast) {
            setHasCompletedOnboarding(true);
            router.replace("/LoginUpScreen");
        } else {
            flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
        }
    };

    const handleSkip = () => {
        setHasCompletedOnboarding(true);
        router.replace("/LoginUpScreen");
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        if (newIndex !== index) setIndex(newIndex);
    };

    const slide = onboardingData[index];

    const renderSlide = ({ item: slide }: { item: OnboardingSlide }) => (
        <ImageBackground
            source={slide.image}
            style={{ width, height }}
            resizeMode="cover"
            imageStyle={{
                width: undefined,
                height: height * 0.65, // Increased height to ensure coverage
                resizeMode: "cover", // Changed to cover for better filling
            }}
        >
            {/* ── Tint ── */}
            <View className="absolute inset-0 bg-black/40" pointerEvents="none" />

            <LinearGradient
                colors={[
                    "transparent",
                    "rgba(0,0,0,0.5)",
                    "rgba(0,0,0,0.85)",
                    "#000000",
                ]}
                locations={[0, 0.3, 0.65, 1]}
                className="absolute left-0 right-0"
                style={{ height: height * 0.7, bottom: 0 }}
                pointerEvents="none"
            />
            {/* ── Top header — slides 3 & 4 ── */}
            {slide.headerTitle && (
                <SafeAreaView
                    className="z-[2] px-6"
                    style={
                        Platform.OS === "android" ? { paddingTop: 56 } : { paddingTop: 24 }
                    }
                >
                    <Text className="text-white text-[28px] tracking-tight" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
                        {slide.headerTitle}
                    </Text>
                    <Text className="text-[28px] tracking-tight mb-2" style={{ fontFamily: 'Lexend_800ExtraBold', color: '#1D4ED8' }}>
                        {slide.headerSubtitle}
                    </Text>
                    {slide.headerDesc && (
                        <Text className="text-white/70 text-sm leading-[21px]" style={{ fontFamily: 'Lexend_400Regular' }}>
                            {slide.headerDesc}
                        </Text>
                    )}
                </SafeAreaView>
            )}

            {/* ── Spacer ── */}
            <View className="flex-1" />

            {/* ── Bottom content ── */}
            <SafeAreaView
                className="px-6 items-center z-[2]"
                style={
                    Platform.OS === "android"
                        ? { paddingBottom: 24 }
                        : { paddingBottom: 16 }
                }
            >
                {/* Features row — slide 4 only */}
                {slide.features && (
                    <View className="flex-row justify-between w-full mb-5">
                        {slide.features.map((f, i) => (
                            <View key={i} className="flex-1 items-center">
                                <Text className="text-2xl mb-1">{f.icon}</Text>
                                <Text className="text-white/70 text-[11px] text-center leading-[15px]" style={{ fontFamily: 'Lexend_400Regular' }}>
                                    {f.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Step badge */}
                <View
                    className="w-[42px] h-[42px] rounded-full items-center justify-center mb-[14px]"
                    style={{
                        backgroundColor: '#1D4ED8',
                        shadowColor: '#1D4ED8',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.55,
                        shadowRadius: 10,
                        elevation: 8,
                    }}
                >
                    <Text className="text-white text-[17px]" style={{ fontFamily: 'Lexend_700Bold' }}>
                        {slide.id ?? index + 1}
                    </Text>
                </View>

                {/* Title */}
                <Text className="text-white text-2xl text-center mb-2 tracking-tight" style={{ fontFamily: 'Lexend_700Bold' }}>
                    {slide.title}
                </Text>

                {/* Description */}
                <Text className="text-white/70 text-sm text-center leading-[21px] mb-5" style={{ fontFamily: 'Lexend_400Regular' }}>
                    {slide.description}
                </Text>

                {/* CTA */}
                <TouchableOpacity
                    className="w-full rounded-2xl py-[15px] items-center mb-[18px]"
                    style={
                        isLast
                            ? {
                                backgroundColor: '#1D4ED8',
                                shadowColor: '#1D4ED8',
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.5,
                                shadowRadius: 12,
                                elevation: 10,
                            }
                            : {
                                borderWidth: 1.5,
                                borderColor: "rgba(255,255,255,0.35)",
                            }
                    }
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text className="text-white text-[15px] tracking-wide" style={{ fontFamily: 'Lexend_600SemiBold' }}>
                        {isLast ? "Get Started" : "Next  →"}
                    </Text>
                </TouchableOpacity>

                {/* Dots */}
                <View className="flex-row gap-2 items-center">
                    {onboardingData.map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                                flatRef.current?.scrollToIndex({ index: i, animated: true });
                            }}
                        >
                            <View
                                style={[
                                    { borderRadius: 9999 },
                                    i === index
                                        ? { width: 26, height: 7, backgroundColor: '#1D4ED8' }
                                        : { width: 7, height: 7, backgroundColor: 'rgba(255,255,255,0.25)' },
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );

    return (
        <View className="flex-1 bg-black">
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />

            {/* ── Swipeable slides ── */}
            <FlatList
                ref={flatRef}
                data={onboardingData}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onScroll}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderSlide}
                getItemLayout={(_, i) => ({
                    length: width,
                    offset: width * i,
                    index: i,
                })}
            />

            {/* ── Skip — fixed above FlatList ── */}
            <SafeAreaView
                className="absolute top-0 left-0 right-0 z-20 items-end"
                pointerEvents="box-none"
            >
                <TouchableOpacity
                    className="py-1 px-2 mr-6"
                    style={
                        Platform.OS === "android" ? { marginTop: 44 } : { marginTop: 54 }
                    }
                    onPress={handleSkip}
                >
                    <Text className="text-white/80 text-sm" style={{ fontFamily: 'Lexend_400Regular' }}>
                        Skip
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}