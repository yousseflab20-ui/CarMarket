import { useAppTheme } from '../hooks/useAppTheme';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Animated, Easing, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Car, Settings2, DollarSign, FileText, ShieldCheck, Edit3, Tag } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { useThemeStore } from '../store/themeStore';

import { useEditCarForm } from '../hooks/useEditCarForm';
import { getCarById } from '../service/car/api';
import { FEATURES, TRANSMISSIONS, FUEL_TYPES, MOROCCAN_CITIES, AnimatedUpdateButtonProps, SectionHeaderProps } from '../types/screens/carForm';

import { FormInput } from '../components/forms/FormInput';
import { ImageUploader } from '../components/forms/ImageUploader';
import { FeatureSelector } from '../components/forms/FeatureSelector';
import { OptionSwitch } from '../components/forms/OptionSwitch';
import { SelectField } from '../components/forms/SelectField';
import { CarStatus } from '../utils/statusConfig';

function AnimatedUpdateButton({ onPress, isLoading }: AnimatedUpdateButtonProps) {
    const { t } = useTranslation();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;
    const textSlide = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    const bgColorAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const triggerAnimation = () => {
        if (isLoading) return;

        bgColorAnim.setValue(0);
        Animated.sequence([
            Animated.timing(bgColorAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
            Animated.timing(bgColorAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]).start();

        glowAnim.setValue(0);
        Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
            Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
        ]).start();

        shimmerAnim.setValue(-1);
        Animated.timing(shimmerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();

        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.93, tension: 300, friction: 10, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1.05, tension: 180, friction: 7, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        ]).start();

        Animated.sequence([
            Animated.timing(textSlide, { toValue: -5, duration: 80, useNativeDriver: true }),
            Animated.spring(textSlide, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }),
        ]).start();

        rippleAnim.setValue(0);
        rippleOpacity.setValue(0.7);
        Animated.parallel([
            Animated.timing(rippleAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        onPress();
    };

    const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.15] });
    const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [-1, 1], outputRange: [-200, 300] });
    const animatedBg = bgColorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#18181B", "#10B981"] });
    const borderColor = bgColorAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(16,185,129,0.25)", "rgba(16,185,129,0.8)"] });

    return (
        <Animated.View className="flex-1 h-[52px] rounded-2xl overflow-hidden items-center justify-center" style={{ transform: [{ scale: scaleAnim }] }}>
            <Animated.View 
                className="absolute w-full h-full rounded-2xl border-2 border-[#10B981]" 
                style={{ opacity: rippleOpacity, transform: [{ scale: rippleScale }] }} 
            />

            <TouchableOpacity
                onPress={triggerAnimation}
                disabled={isLoading}
                activeOpacity={1}
                style={{ flex: 1, width: "100%" }}
            >
                <Animated.View 
                    className="flex-1 w-full items-center justify-center rounded-2xl overflow-hidden border" 
                    style={{ backgroundColor: animatedBg, borderColor }}
                >
                    <Animated.View 
                        className="absolute top-0 left-0 w-[80px] h-full bg-white/[0.18]" 
                        style={{ transform: [{ translateX: shimmerTranslate }, { skewX: "-20deg" }] }} 
                    />

                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Animated.View 
                            className="flex-row items-center gap-2" 
                            style={{ transform: [{ translateY: textSlide }] }}
                        >
                            <Edit3 size={18} color="#fff" strokeWidth={2.5} />
                            <Text className="text-white text-[15px]" style={{ fontFamily: "Lexend_700Bold" }}>{t('editCar.updateListing')}</Text>
                        </Animated.View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
    const { theme, systemTheme, isDark } = useAppTheme();
    return (
        <View className="flex-row items-center gap-2.5 mt-6 mb-3">
            <View className="w-7 h-7 rounded border items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.2)' }}>{icon}</View>
            <Text className="text-[13px] tracking-widest uppercase" style={{ color: isDark ? '#94A3B8' : '#64748B', fontFamily: 'Lexend_700Bold' }}>{title}</Text>
            <View className="flex-1 h-[1px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)' }} />
        </View>
    );
}

export default function EditCarScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const Carid = Number(id);
    const [status, setStatus] = useState<'AVAILABLE' | 'RESERVED' | 'SOLD'>('AVAILABLE');
    const { theme, systemTheme, isDark } = useAppTheme();
    const C = {
        bg: isDark ? '#09090B' : '#F8FAFC',
        surface: isDark ? '#18181B' : '#FFFFFF',
        border: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
        white: isDark ? '#FFFFFF' : '#0F172A',
        muted: isDark ? '#94A3B8' : '#64748B',
        blue: '#3B82F6',
    };

    const { data: carData, isLoading: isQueryLoading, error } = useQuery({
        queryKey: ["car", id],
        queryFn: () => getCarById(Carid),
        enabled: !!Carid,
    });

    const { form, images, setImages, handleSubmit: submitCar, isLoading } = useEditCarForm({
        carId: Carid,
        initialData: carData,
        onSuccess: () => router.back(),
        status: status,
    });
    
    const allowedTransitions: Record<string, string[]> = {
        AVAILABLE: ['AVAILABLE', 'RESERVED', 'SOLD'],
        RESERVED: ['RESERVED', 'SOLD'],
        SOLD: ['SOLD'],
    };

    const canChangeTo = (target: string) => {
        const currentStatus = carData?.get?.status?.toUpperCase();
        if (!currentStatus || !allowedTransitions[currentStatus]) return true;
        return allowedTransitions[currentStatus].includes(target.toUpperCase());
    };

    const handleFinalSubmit = () => {
        const currentStatus = carData?.get?.status?.toUpperCase();

        if (currentStatus && allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(status.toUpperCase())) {
            alert("Invalid status change");
            return;
        }

        submitCar();
    };
    const { control, watch } = form;

    if (isQueryLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ color: C.muted, marginTop: 12, fontFamily: "Lexend_400Regular" }}>
                    {t('editCar.loading')}
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#EF4444", fontSize: 16, fontFamily: "Lexend_500Medium" }}>
                    {t('editCar.failedLoad')}
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: C.blue, fontFamily: "Lexend_500Medium" }}>{t('editCar.goBack')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                <View className="flex-row justify-between items-center px-5 py-3.5 mb-1">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-[42px] h-[42px] rounded-xl items-center justify-center border"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: C.border }}
                    >
                        <ArrowLeft size={20} color={C.white} />
                    </TouchableOpacity>
                    <Text className="text-xl tracking-[0.3px]" style={{ color: C.white, fontFamily: 'Lexend_700Bold' }}>{t('editCar.title')}</Text>
                    <View className="w-[42px]" />
                </View>

                <View className="px-4 pb-5">

                    <ImageUploader images={images} onImagesChange={setImages} />

                    <SectionHeader
                        icon={<Tag size={14} color="#3B82F6" />}
                        title="Listing Status"
                    />

                    <View className="rounded-2xl p-4 border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <View className="flex-row gap-2 justify-between">
                            <TouchableOpacity
                                disabled={!canChangeTo('AVAILABLE')}
                                className={["flex-1 flex-row items-center justify-center py-3 rounded-xl gap-1.5", !canChangeTo('AVAILABLE') ? "opacity-40" : ""].join(" ")}
                                style={{ backgroundColor: status === 'AVAILABLE' ? 'rgba(59,130,246,0.1)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: status === 'AVAILABLE' ? 'rgba(59,130,246,0.3)' : C.border }}
                                onPress={() => setStatus('AVAILABLE')}
                            >
                                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                                <Text style={{ color: status === 'AVAILABLE' ? C.white : C.muted, fontFamily: 'Lexend_600SemiBold', fontSize: 13 }}>Available</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!canChangeTo('RESERVED')}
                                className={["flex-1 flex-row items-center justify-center py-3 rounded-xl gap-1.5", !canChangeTo('RESERVED') ? "opacity-40" : ""].join(" ")}
                                style={{ backgroundColor: status === 'RESERVED' ? 'rgba(59,130,246,0.1)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: status === 'RESERVED' ? 'rgba(59,130,246,0.3)' : C.border }}
                                onPress={() => setStatus('RESERVED')}
                            >
                                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                                <Text style={{ color: status === 'RESERVED' ? C.white : C.muted, fontFamily: 'Lexend_600SemiBold', fontSize: 13 }}>Reserved</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!canChangeTo('SOLD')}
                                className={["flex-1 flex-row items-center justify-center py-3 rounded-xl gap-1.5", !canChangeTo('SOLD') ? "opacity-40" : ""].join(" ")}
                                style={{ backgroundColor: status === 'SOLD' ? 'rgba(239,68,68,0.1)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: status === 'SOLD' ? 'rgba(239,68,68,0.3)' : C.border }}
                                onPress={() => setStatus('SOLD')}
                            >
                                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                                <Text style={{ color: status === 'SOLD' ? C.white : C.muted, fontFamily: 'Lexend_600SemiBold', fontSize: 13 }}>Sold</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SectionHeader
                        icon={<Edit3 size={14} color="#3B82F6" />}
                        title="Vehicle Condition"
                    />

                    <View className="rounded-2xl p-4 border mb-2" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <Controller
                            control={control}
                            name="condition"
                            render={({ field: { value, onChange } }) => (
                                <View className="flex-row gap-2">
                                    {([
                                        { key: 'Excellent', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', dot: '#10B981' },
                                        { key: 'Good',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)', dot: '#3B82F6' },
                                        { key: 'Damaged',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',  dot: '#EF4444' },
                                    ] as const).map(({ key, color, bg, border, dot }) => (
                                        <TouchableOpacity
                                            key={key}
                                            className="flex-1 items-center justify-center py-3.5 rounded-xl gap-1.5"
                                            style={{
                                                backgroundColor: value === key ? bg : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                                borderWidth: 1.5,
                                                borderColor: value === key ? border : isDark ? 'rgba(255,255,255,0.07)' : '#E2E8F0',
                                            }}
                                            onPress={() => onChange(key)}
                                        >
                                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
                                            <Text style={{
                                                color: value === key ? color : isDark ? '#5A6A82' : '#94A3B8',
                                                fontFamily: 'Lexend_600SemiBold',
                                                fontSize: 11,
                                                marginTop: 1,
                                            }}>
                                                {key}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        />
                    </View>

                    <SectionHeader
                        icon={<Car size={14} color="#3B82F6" />}
                        title={t('addCar.basicInfo')}
                    />

                    <View className="rounded-2xl p-4 border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <FormInput
                            control={control}
                            name="title"
                            label={t('addCar.carTitle')}
                            required
                            placeholder={t('addCar.titlePlaceholder')}
                        />

                        <View className="flex-row mt-0">
                            <FormInput
                                control={control}
                                name="brand"
                                label={t('addCar.brand')}
                                required
                                placeholder={t('addCar.brandPlaceholder')}
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="model"
                                label={t('addCar.model')}
                                required
                                placeholder={t('addCar.modelPlaceholder')}
                                containerStyle={{ flex: 1 }}
                            />
                        </View>

                        <View className="flex-row mt-0">
                            <FormInput
                                control={control}
                                name="year"
                                label={t('addCar.year')}
                                required
                                placeholder={t('addCar.yearPlaceholder')}
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="mileage"
                                label={t('addCar.mileage')}
                                placeholder={t('addCar.mileagePlaceholder')}
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>

                        <Controller
                            control={control}
                            name="city"
                            render={({ field: { value, onChange } }) => (
                                <SelectField
                                    label={t('filter.city')}
                                    options={[...MOROCCAN_CITIES]}
                                    value={value}
                                    onValueChange={onChange}
                                    containerStyle={{ marginTop: 12 }}
                                />
                            )}
                        />
                    </View>

                    <SectionHeader
                        icon={<Settings2 size={14} color="#3B82F6" />}
                        title={t('addCar.specs')}
                    />

                    <View className="rounded-2xl p-4 border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <View className="flex-row mt-0">
                            <FormInput
                                control={control}
                                name="speed"
                                label={t('addCar.speed')}
                                placeholder={t('addCar.speedPlaceholder')}
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="seats"
                                label={t('addCar.seats')}
                                placeholder={t('addCar.seatsPlaceholder')}
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>

                        <View className="flex-row mt-0">
                            <Controller
                                control={control}
                                name="transmission"
                                render={({ field: { value, onChange } }) => (
                                    <SelectField
                                        label={t('addCar.transmission')}
                                        options={TRANSMISSIONS}
                                        value={value}
                                        onValueChange={onChange}
                                        containerStyle={{ flex: 1 }}
                                        translationKey="form.transmissions"
                                    />
                                )}
                            />
                            <View style={{ width: 12 }} />
                            <Controller
                                control={control}
                                name="fuelType"
                                render={({ field: { value, onChange } }) => (
                                    <SelectField
                                        label={t('addCar.fuelType')}
                                        options={FUEL_TYPES}
                                        value={value}
                                        onValueChange={onChange}
                                        containerStyle={{ flex: 1 }}
                                        translationKey="form.fuelTypes"
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <SectionHeader
                        icon={<DollarSign size={14} color="#3B82F6" />}
                        title={t('addCar.pricing')}
                    />

                    <View className="rounded-2xl p-4 border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <View className="flex-row mt-0">
                            <FormInput
                                control={control}
                                name="price"
                                label={t('addCar.totalPrice')}
                                required
                                placeholder={t('addCar.pricePlaceholder')}
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="pricePerDay"
                                label={t('addCar.priceDay')}
                                required
                                placeholder={t('addCar.priceDayPlaceholder')}
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    {/* NEGOTIATION SECTION */}
                    <SectionHeader
                        icon={<DollarSign size={14} color="#3B82F6" />}
                        title="How do you want to sell this car?"
                    />
                    <Controller
                        control={control}
                        name="negotiationMode"
                        render={({ field: { value, onChange } }) => (
                            <View className="flex-col gap-3 mb-2">
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => onChange('FIRM')}
                                    className="rounded-[20px] p-4 flex-row items-center border"
                                    style={{
                                        backgroundColor: value === 'FIRM' ? (isDark ? "rgba(59,130,246,0.1)" : "#EFF6FF") : C.surface,
                                        borderColor: value === 'FIRM' ? "#3B82F6" : C.border
                                    }}
                                >
                                    <Text className="text-2xl mr-4">🔒</Text>
                                    <View className="flex-1">
                                        <Text className="text-[15px] mb-0.5" style={{ fontFamily: "Lexend_700Bold", color: C.white }}>Fixed Price</Text>
                                        <Text className="text-[13px]" style={{ fontFamily: "Lexend_400Regular", color: isDark ? "#94A3B8" : "#64748B" }}>The price is final. Buyers can't negotiate.</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => onChange('FLEXIBLE')}
                                    className="rounded-[20px] p-4 flex-row items-center border"
                                    style={{
                                        backgroundColor: value === 'FLEXIBLE' ? (isDark ? "rgba(59,130,246,0.1)" : "#EFF6FF") : C.surface,
                                        borderColor: value === 'FLEXIBLE' ? "#3B82F6" : C.border
                                    }}
                                >
                                    <Text className="text-2xl mr-4">💬</Text>
                                    <View className="flex-1">
                                        <Text className="text-[15px] mb-0.5" style={{ fontFamily: "Lexend_700Bold", color: C.white }}>Open to Offers</Text>
                                        <Text className="text-[13px]" style={{ fontFamily: "Lexend_400Regular", color: isDark ? "#94A3B8" : "#64748B" }}>Buyers can send offers. You decide what to accept.</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => onChange('SMART')}
                                    className="rounded-[20px] p-4 flex-row items-center border relative overflow-hidden"
                                    style={{
                                        backgroundColor: value === 'SMART' ? (isDark ? "rgba(59,130,246,0.1)" : "#EFF6FF") : C.surface,
                                        borderColor: value === 'SMART' ? "#3B82F6" : C.border
                                    }}
                                >
                                    <Text className="text-2xl mr-4">🤖</Text>
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-0.5 gap-2">
                                            <Text className="text-[15px]" style={{ fontFamily: "Lexend_700Bold", color: C.white }}>Smart Negotiation</Text>
                                            <View className="bg-blue-500 px-2 py-0.5 rounded-full">
                                                <Text className="text-white text-[10px]" style={{ fontFamily: "Lexend_700Bold" }}>Recommended</Text>
                                            </View>
                                        </View>
                                        <Text className="text-[13px]" style={{ fontFamily: "Lexend_400Regular", color: isDark ? "#94A3B8" : "#64748B" }}>CarMarket automatically filters low offers and helps handle negotiations for you.</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    {watch('negotiationMode') === 'SMART' && (
                        <View className="rounded-[20px] p-4 mb-4" style={{ backgroundColor: isDark ? "rgba(59,130,246,0.03)" : "rgba(59,130,246,0.03)", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)" }}>
                            <View className="mb-4">
                                <Text className="text-[13px] mb-1" style={{ color: isDark ? "#8B9CB8" : "#64748B", fontFamily: "Lexend_500Medium" }}>Auto-Accept Price</Text>
                                <Text className="text-[11px] mb-2" style={{ color: isDark ? "#64748B" : "#94A3B8", fontFamily: "Lexend_400Regular" }}>If a buyer offers this amount or more, the offer can be accepted automatically.</Text>
                                <FormInput
                                    control={control}
                                    name="autoAcceptPrice"
                                    label=""
                                    placeholder="e.g. 48000"
                                    keyboardType="number-pad"
                                />
                            </View>

                            <View className="mb-2">
                                <Text className="text-[13px] mb-1" style={{ color: isDark ? "#8B9CB8" : "#64748B", fontFamily: "Lexend_500Medium" }}>Minimum Acceptable Price</Text>
                                <Text className="text-[11px] mb-2" style={{ color: isDark ? "#64748B" : "#94A3B8", fontFamily: "Lexend_400Regular" }}>Offers below this price will be rejected automatically.</Text>
                                <FormInput
                                    control={control}
                                    name="hiddenMinimumPrice"
                                    label=""
                                    placeholder="e.g. 45000"
                                    keyboardType="number-pad"
                                />
                            </View>
                            
                            <View className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0" }}>
                                <Text className="text-[12px] mb-3" style={{ color: isDark ? "#94A3B8" : "#64748B", fontFamily: "Lexend_600SemiBold" }}>Advanced Settings</Text>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-[13px] mb-1" style={{ color: isDark ? "#8B9CB8" : "#64748B", fontFamily: "Lexend_500Medium" }}>Maximum offers per buyer</Text>
                                        <Text className="text-[11px]" style={{ color: isDark ? "#64748B" : "#94A3B8", fontFamily: "Lexend_400Regular" }}>Limit how many times a buyer can submit an offer for this car.</Text>
                                    </View>
                                    <View className="w-20">
                                        <FormInput
                                            control={control}
                                            name="maxOfferAttempts"
                                            label=""
                                            placeholder="3"
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </View>
                                <View className="flex-row items-center justify-between mt-4">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-[13px] mb-1" style={{ color: isDark ? "#8B9CB8" : "#64748B", fontFamily: "Lexend_500Medium" }}>Negotiation Deadline (Days)</Text>
                                        <Text className="text-[11px]" style={{ color: isDark ? "#64748B" : "#94A3B8", fontFamily: "Lexend_400Regular" }}>Close unanswered negotiations after this many days.</Text>
                                    </View>
                                    <View className="w-20">
                                        <FormInput
                                            control={control}
                                            name="negotiationDeadlineDays"
                                            label=""
                                            placeholder="7"
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <Controller
                        control={control}
                        name="features"
                        render={({ field: { value, onChange } }) => (
                            <FeatureSelector
                                features={FEATURES}
                                selectedFeatures={value}
                                onFeaturesChange={onChange}
                                translationKey="form.features"
                            />
                        )}
                    />

                    <SectionHeader
                        icon={<FileText size={14} color="#3B82F6" />}
                        title={t('addCar.description')}
                    />

                    <View className="rounded-2xl p-4 border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <FormInput
                            control={control}
                            name="description"
                            label=""
                            placeholder={t('addCar.descPlaceholder')}
                            multiline
                            numberOfLines={4}
                            style={{
                                minHeight: 100,
                                textAlignVertical: 'top',
                                color: C.white,
                                fontFamily: 'Lexend_400Regular',
                                paddingTop: 4,
                            }}
                        />
                    </View>

                    <SectionHeader
                        icon={<ShieldCheck size={14} color="#3B82F6" />}
                        title={t('addCar.options')}
                    />

                    <View className="rounded-2xl p-4 border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <Controller
                            control={control}
                            name="insuranceIncluded"
                            render={({ field: { value, onChange } }) => (
                                <OptionSwitch
                                    label={t('addCar.insurance')}
                                    subtitle={t('addCar.insuranceSub')}
                                    value={value}
                                    onValueChange={onChange}
                                />
                            )}
                        />
                        <View className="h-[1px] my-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)' }} />
                        <Controller
                            control={control}
                            name="deliveryAvailable"
                            render={({ field: { value, onChange } }) => (
                                <OptionSwitch
                                    label={t('addCar.delivery')}
                                    subtitle={t('addCar.deliverySub')}
                                    value={value}
                                    onValueChange={onChange}
                                />
                            )}
                        />
                    </View>

                    <View className="flex-row gap-3 mt-[50px] mb-5">
                        <TouchableOpacity
                            className="flex-1 py-[15px] rounded-2xl items-center"
                            style={{ borderWidth: 1.5, borderColor: C.blue, backgroundColor: 'rgba(59,130,246,0.06)' }}
                            onPress={() => router.back()}
                            disabled={isLoading}
                            activeOpacity={0.75}
                        >
                            <Text style={{ color: C.blue, fontSize: 15, fontFamily: 'Lexend_700Bold' }}>{t('addCar.cancel')}</Text>
                        </TouchableOpacity>

                        <AnimatedUpdateButton
                            isLoading={isLoading}
                            onPress={handleFinalSubmit}
                        />
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
