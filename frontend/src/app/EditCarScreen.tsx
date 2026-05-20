import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Car, Settings2, DollarSign, FileText, ShieldCheck, Edit3, Tag } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';

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
    return (
        <View className="flex-row items-center gap-2.5 mt-6 mb-3">
            <View className="w-7 h-7 rounded bg-[#3B82F6]/12 border border-[#3B82F6]/20 items-center justify-center">{icon}</View>
            <Text className="text-[13px] text-[#94A3B8] tracking-widest uppercase" style={{ fontFamily: 'Lexend_700Bold' }}>{title}</Text>
            <View className="flex-1 h-[1px] bg-white/[0.05]" />
        </View>
    );
}

export default function EditCarScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const Carid = Number(id);
    const [status, setStatus] = useState<'available' | 'reserved' | 'sold'>('available');

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
    
    const allowedTransitions: Record<CarStatus, CarStatus[]> = {
        available: ['available', 'reserved', 'sold'],
        reserved: ['reserved', 'sold'],
        sold: ['sold'],
    };

    const canChangeTo = (target: CarStatus) => {
        const currentStatus = carData?.get?.status as CarStatus;
        if (!currentStatus) return true;
        return allowedTransitions[currentStatus].includes(target);
    };

    const handleFinalSubmit = () => {
        const currentStatus = carData?.get?.status as CarStatus;

        if (currentStatus && !allowedTransitions[currentStatus].includes(status)) {
            alert("Invalid status change");
            return;
        }

        submitCar();
    };
    const { control } = form;

    if (isQueryLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#09090B', justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ color: "#94A3B8", marginTop: 12, fontFamily: "Lexend_400Regular" }}>
                    {t('editCar.loading')}
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#09090B', justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#EF4444", fontSize: 16, fontFamily: "Lexend_500Medium" }}>
                    {t('editCar.failedLoad')}
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: "#3B82F6", fontFamily: "Lexend_500Medium" }}>{t('editCar.goBack')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#09090B' }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                <View className="flex-row justify-between items-center px-5 py-3.5 mb-1">
                    <TouchableOpacity onPress={() => router.back()} className="w-[42px] h-[42px] rounded-xl bg-white/[0.05] border border-white/[0.08] items-center justify-center">
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-xl text-white tracking-[0.3px]" style={{ fontFamily: 'Lexend_700Bold' }}>{t('editCar.title')}</Text>
                    <View className="w-[42px]" />
                </View>

                <View className="px-4 pb-5">

                    <ImageUploader images={images} onImagesChange={setImages} />

                    <SectionHeader
                        icon={<Tag size={14} color="#3B82F6" />}
                        title="Listing Status"
                    />

                    <View className="bg-[#18181B] rounded-2.5xl p-4 border border-white/[0.05]">
                        <View className="flex-row gap-2 justify-between">
                            <TouchableOpacity
                                disabled={!canChangeTo('available')}
                                className={["flex-1 flex-row items-center justify-center py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] gap-1.5", status === 'available' ? "bg-[#3B82F6]/10 border-[#3B82F6]/30" : "", !canChangeTo('available') ? "opacity-40" : ""].join(" ")}
                                onPress={() => setStatus('available')}
                            >
                                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                                <Text className={["text-[#94A3B8] text-[13px]", status === 'available' ? "text-white" : ""].join(" ")} style={{ fontFamily: 'Lexend_600SemiBold' }}>Available</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!canChangeTo('reserved')}
                                className={["flex-1 flex-row items-center justify-center py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] gap-1.5", status === 'reserved' ? "bg-[#3B82F6]/10 border-[#3B82F6]/30" : "", !canChangeTo('reserved') ? "opacity-40" : ""].join(" ")}
                                onPress={() => setStatus('reserved')}
                            >
                                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                                <Text className={["text-[#94A3B8] text-[13px]", status === 'reserved' ? "text-white" : ""].join(" ")} style={{ fontFamily: 'Lexend_600SemiBold' }}>Reserved</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!canChangeTo('sold')}
                                className={["flex-1 flex-row items-center justify-center py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] gap-1.5", status === 'sold' ? "bg-[#EF4444]/10 border-[#EF4444]/30" : "", !canChangeTo('sold') ? "opacity-40" : ""].join(" ")}
                                onPress={() => setStatus('sold')}
                            >
                                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                                <Text className={["text-[#94A3B8] text-[13px]", status === 'sold' ? "text-white" : ""].join(" ")} style={{ fontFamily: 'Lexend_600SemiBold' }}>Sold</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SectionHeader
                        icon={<Car size={14} color="#3B82F6" />}
                        title={t('addCar.basicInfo')}
                    />

                    <View className="bg-[#18181B] rounded-2.5xl p-4 border border-white/[0.05]">
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

                    <View className="bg-[#18181B] rounded-2.5xl p-4 border border-white/[0.05]">
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

                    <View className="bg-[#18181B] rounded-2.5xl p-4 border border-white/[0.05]">
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

                    <View className="bg-[#18181B] rounded-2.5xl p-4 border border-white/[0.05]">
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
                                color: '#fff',
                                fontFamily: 'Lexend_400Regular',
                                paddingTop: 4,
                            }}
                        />
                    </View>

                    <SectionHeader
                        icon={<ShieldCheck size={14} color="#3B82F6" />}
                        title={t('addCar.options')}
                    />

                    <View className="bg-[#18181B] rounded-2.5xl p-4 border border-white/[0.05]">
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
                        <View className="h-[1px] bg-white/[0.05] my-1" />
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
                            className="flex-1 border-[1.5px] border-[#3B82F6] py-[15px] rounded-2xl items-center bg-[#3B82F6]/6"
                            onPress={() => router.back()}
                            disabled={isLoading}
                            activeOpacity={0.75}
                        >
                            <Text className="text-[#3B82F6] text-[15px]" style={{ fontFamily: 'Lexend_700Bold' }}>{t('addCar.cancel')}</Text>
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