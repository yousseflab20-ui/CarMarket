import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Car, Settings2, DollarSign, FileText, ShieldCheck, Edit3 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useRef } from 'react';
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
    const animatedBg = bgColorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#1C1F26", "#10B981"] });
    const borderColor = bgColorAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(16,185,129,0.25)", "rgba(16,185,129,0.8)"] });

    return (
        <Animated.View style={[abStyles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
            <Animated.View style={[abStyles.ripple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />

            <TouchableOpacity
                onPress={triggerAnimation}
                disabled={isLoading}
                activeOpacity={1}
                style={{ flex: 1, width: "100%" }}
            >
                <Animated.View style={[abStyles.inner, { backgroundColor: animatedBg, borderColor }]}>
                    <Animated.View style={[abStyles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />

                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Animated.View style={[abStyles.content, { transform: [{ translateY: textSlide }] }]}>
                            <Edit3 size={18} color="#fff" strokeWidth={2.5} />
                            <Text style={abStyles.label}>{t('editCar.updateListing')}</Text>
                        </Animated.View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const abStyles = StyleSheet.create({
    wrapper: {
        flex: 1, height: 52, borderRadius: 16, overflow: "hidden",
        alignItems: "center", justifyContent: "center",
    },
    ripple: {
        position: "absolute", width: "100%", height: "100%", borderRadius: 16,
        borderWidth: 2, borderColor: "#10B981",
    },
    inner: {
        flex: 1, width: "100%",
        alignItems: "center", justifyContent: "center",
        borderRadius: 16, overflow: "hidden",
        borderWidth: 1,
    },
    shimmer: {
        position: "absolute", top: 0, left: 0,
        width: 80, height: "100%",
        backgroundColor: "rgba(255,255,255,0.18)",
        transform: [{ skewX: "-20deg" }],
    },
    content: { flexDirection: "row", alignItems: "center", gap: 8 },
    label: { color: "#fff", fontSize: 15, fontFamily: "Lexend_700Bold" },
});

function SectionHeader({ icon, title }: SectionHeaderProps) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>{icon}</View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionLine} />
        </View>
    );
}

export default function EditCarScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const Carid = Number(id);

    const { data: carData, isLoading: isQueryLoading, error } = useQuery({
        queryKey: ["car", id],
        queryFn: () => getCarById(Carid),
        enabled: !!Carid,
    });

    const { form, images, setImages, handleSubmit, isLoading } = useEditCarForm({
        carId: Carid,
        initialData: carData,
        onSuccess: () => router.back(),
    });

    const { control } = form;

    if (isQueryLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ color: "#94A3B8", marginTop: 12, fontFamily: "Lexend_400Regular" }}>
                    {t('editCar.loading')}
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
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
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('editCar.title')}</Text>
                    <View style={{ width: 42 }} />
                </View>

                <View style={styles.formContainer}>

                    <ImageUploader images={images} onImagesChange={setImages} />

                    <SectionHeader
                        icon={<Car size={14} color="#3B82F6" />}
                        title={t('addCar.basicInfo')}
                    />

                    <View style={styles.card}>
                        <FormInput
                            control={control}
                            name="title"
                            label={t('addCar.carTitle')}
                            required
                            placeholder={t('addCar.titlePlaceholder')}
                        />

                        <View style={styles.row}>
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

                        <View style={styles.row}>
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

                    <View style={styles.card}>
                        <View style={styles.row}>
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

                        <View style={styles.row}>
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

                    <View style={styles.card}>
                        <View style={styles.row}>
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

                    <View style={styles.card}>
                        <FormInput
                            control={control}
                            name="description"
                            label=""
                            placeholder={t('addCar.descPlaceholder')}
                            multiline
                            numberOfLines={4}
                            style={styles.descriptionInput}
                        />
                    </View>

                    <SectionHeader
                        icon={<ShieldCheck size={14} color="#3B82F6" />}
                        title={t('addCar.options')}
                    />

                    <View style={styles.card}>
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
                        <View style={styles.optionDivider} />
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

                    <View style={styles.submitSection}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={isLoading}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.cancelButtonText}>{t('addCar.cancel')}</Text>
                        </TouchableOpacity>

                        <AnimatedUpdateButton onPress={handleSubmit} isLoading={isLoading} />
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0E14',
    },
    scrollView: { flex: 1 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginBottom: 4,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Lexend_700Bold',
        color: '#fff',
        letterSpacing: 0.3,
    },

    formContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Lexend_700Bold',
        color: '#94A3B8',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    card: {
        backgroundColor: '#1C1F26',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },

    row: {
        flexDirection: 'row',
        marginTop: 0,
    },

    descriptionInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        color: '#fff',
        fontFamily: 'Lexend_400Regular',
        paddingTop: 4,
    },

    optionDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 4,
    },

    submitSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 50,
        bottom: 20
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
    },
    cancelButtonText: {
        color: '#3B82F6',
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
    },
});