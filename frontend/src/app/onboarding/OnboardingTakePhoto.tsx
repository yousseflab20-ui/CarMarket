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
import { onboardingData } from "./onboardingData";
import { LinearGradient } from "expo-linear-gradient";

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

    const renderSlide = ({ item: slide }: { item: (typeof onboardingData)[0] }) => (
        <ImageBackground
            source={slide.image}
            style={{ width, height }}
            resizeMode="cover"
            imageStyle={{
                width: undefined,
                height: 500,
                resizeMode: "contain",
            }}
        >
            {/* ── Tint ── */}
            <View className="absolute inset-0 bg-black/35" pointerEvents="none" />

            <LinearGradient
                colors={[
                    "transparent",
                    "rgba(0,0,0,0.4)",
                    "rgba(0,0,0,0.75)",
                    "rgba(0,0,0,0.92)",
                ]}
                locations={[0, 0.35, 0.6, 1]}
                className="absolute left-0 right-0"
                style={{ height: height * 0.55, bottom: 0 }}
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
                    <Text className="text-white text-[28px] font-['Lexend_800ExtraBold'] tracking-tight">
                        {slide.headerTitle}
                    </Text>
                    <Text className="text-orange-500 text-[28px] font-['Lexend_800ExtraBold'] tracking-tight mb-2">
                        {slide.headerSubtitle}
                    </Text>
                    {slide.headerDesc && (
                        <Text className="text-white/70 text-sm font-['Lexend_400Regular'] leading-[21px]">
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
                                <Text className="text-white/70 text-[11px] font-['Lexend_400Regular'] text-center leading-[15px]">
                                    {f.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Step badge */}
                <View
                    className="w-[42px] h-[42px] rounded-full bg-orange-500 items-center justify-center mb-[14px]"
                    style={{
                        shadowColor: "#F97316",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.55,
                        shadowRadius: 10,
                        elevation: 8,
                    }}
                >
                    <Text className="text-white text-[17px] font-['Lexend_700Bold']">
                        {slide.stepNumber}
                    </Text>
                </View>

                {/* Title */}
                <Text className="text-white text-2xl font-['Lexend_700Bold'] text-center mb-2 tracking-tight">
                    {slide.title}
                </Text>

                {/* Description */}
                <Text className="text-white/70 text-sm font-['Lexend_400Regular'] text-center leading-[21px] mb-5">
                    {slide.description}
                </Text>

                {/* CTA */}
                <TouchableOpacity
                    className={`w-full rounded-2xl py-[15px] items-center mb-[18px] ${isLast ? "bg-orange-500" : "bg-white/[0.08]"
                        }`}
                    style={
                        isLast
                            ? {
                                shadowColor: "#F97316",
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
                    <Text className="text-white text-[15px] font-['Lexend_600SemiBold'] tracking-wide">
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
                                className={`h-[7px] rounded-full ${i === index
                                    ? "w-[26px] bg-orange-500"
                                    : "w-[7px] bg-white/25"
                                    }`}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );

    return (
        <View className="flex-1 bg-[#0D0D0D]">
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
                    <Text className="text-white/80 text-sm font-['Lexend_400Regular']">
                        Skip
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}