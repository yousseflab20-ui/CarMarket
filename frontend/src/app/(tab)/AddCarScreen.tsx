import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Animated, Easing } from 'react-native';
import { ArrowLeft, Car, Settings2, DollarSign, FileText, ShieldCheck, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useRef } from 'react';

import { useCarForm } from '../../hooks/useCarForm';
import { FEATURES, TRANSMISSIONS, FUEL_TYPES } from '../../schemas/carFormSchema';
import { FormInput } from '../../components/forms/FormInput';
import { ImageUploader } from '../../components/forms/ImageUploader';
import { FeatureSelector } from '../../components/forms/FeatureSelector';
import { OptionSwitch } from '../../components/forms/OptionSwitch';
import { SelectField } from '../../components/forms/SelectField';
import { router } from 'expo-router';

// ─── Animated Add Car Button ──────────────────────────────────────────────────
function AnimatedAddButton({ onPress, isLoading }: { onPress: () => void; isLoading: boolean }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;
    const textSlide = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    const bgColorAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const triggerAnimation = () => {
        if (isLoading) return;

        // Flash bg blue then back to dark
        bgColorAnim.setValue(0);
        Animated.sequence([
            Animated.timing(bgColorAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
            Animated.timing(bgColorAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]).start();

        // Glow pulse
        glowAnim.setValue(0);
        Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
            Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
        ]).start();

        // Shimmer sweep
        shimmerAnim.setValue(-1);
        Animated.timing(shimmerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();

        // Scale bounce
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.93, tension: 300, friction: 10, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1.05, tension: 180, friction: 7, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        ]).start();

        // Text bounce up
        Animated.sequence([
            Animated.timing(textSlide, { toValue: -5, duration: 80, useNativeDriver: true }),
            Animated.spring(textSlide, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }),
        ]).start();

        // Ripple ring
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
    const animatedBg = bgColorAnim.interpolate({ inputRange: [0, 1], outputRange: ["#1C1F26", "#3B82F6"] });
    const borderColor = bgColorAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(59,130,246,0.25)", "rgba(59,130,246,0.8)"] });

    return (
        <Animated.View style={[abStyles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
            {/* Ripple — stays inside btn bounds */}
            <Animated.View style={[abStyles.ripple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />

            <TouchableOpacity
                onPress={triggerAnimation}
                disabled={isLoading}
                activeOpacity={1}
                style={{ flex: 1, width: "100%" }}
            >
                <Animated.View style={[abStyles.inner, { backgroundColor: animatedBg, borderColor }]}>
                    {/* Shimmer overlay */}
                    <Animated.View style={[abStyles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />

                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Animated.View style={[abStyles.content, { transform: [{ translateY: textSlide }] }]}>
                            <Plus size={18} color="#fff" strokeWidth={2.5} />
                            <Text style={abStyles.label}>Add Car</Text>
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
        borderWidth: 2, borderColor: "#3B82F6",
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
    label: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
// ─────────────────────────────────────────────────────────────────────────────

// Section header component with icon
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>{icon}</View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionLine} />
        </View>
    );
}

export default function AddCarScreen() {
    const { form, images, setImages, handleSubmit, isLoading } = useCarForm({
        onSuccess: () => router.back(),
    });

    const { control } = form;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Car</Text>
                    <View style={{ width: 42 }} />
                </View>

                <View style={styles.formContainer}>

                    {/* Image Uploader */}
                    <ImageUploader images={images} onImagesChange={setImages} />

                    {/* Basic Information */}
                    <SectionHeader
                        icon={<Car size={14} color="#3B82F6" />}
                        title="Basic Information"
                    />

                    <View style={styles.card}>
                        <FormInput
                            control={control}
                            name="title"
                            label="Car Title"
                            required
                            placeholder="e.g., BMW M4 2024"
                        />

                        <View style={styles.row}>
                            <FormInput
                                control={control}
                                name="brand"
                                label="Brand"
                                required
                                placeholder="BMW"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="model"
                                label="Model"
                                required
                                placeholder="M4"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>

                        <View style={styles.row}>
                            <FormInput
                                control={control}
                                name="year"
                                label="Year"
                                required
                                placeholder="2024"
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="mileage"
                                label="Mileage (km)"
                                placeholder="0"
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    {/* Specifications */}
                    <SectionHeader
                        icon={<Settings2 size={14} color="#3B82F6" />}
                        title="Specifications"
                    />

                    <View style={styles.card}>
                        <View style={styles.row}>
                            <FormInput
                                control={control}
                                name="speed"
                                label="Speed (mph)"
                                placeholder="180"
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="seats"
                                label="Seats"
                                placeholder="5"
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
                                        label="Transmission"
                                        options={TRANSMISSIONS}
                                        value={value}
                                        onValueChange={onChange}
                                        containerStyle={{ flex: 1 }}
                                    />
                                )}
                            />
                            <View style={{ width: 12 }} />
                            <Controller
                                control={control}
                                name="fuelType"
                                render={({ field: { value, onChange } }) => (
                                    <SelectField
                                        label="Fuel Type"
                                        options={FUEL_TYPES}
                                        value={value}
                                        onValueChange={onChange}
                                        containerStyle={{ flex: 1 }}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    {/* Pricing */}
                    <SectionHeader
                        icon={<DollarSign size={14} color="#3B82F6" />}
                        title="Pricing"
                    />

                    <View style={styles.card}>
                        <View style={styles.row}>
                            <FormInput
                                control={control}
                                name="price"
                                label="Total Price ($)"
                                required
                                placeholder="45000"
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ width: 12 }} />
                            <FormInput
                                control={control}
                                name="pricePerDay"
                                label="Price/Day ($)"
                                required
                                placeholder="200"
                                keyboardType="number-pad"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    {/* Features */}
                    <Controller
                        control={control}
                        name="features"
                        render={({ field: { value, onChange } }) => (
                            <FeatureSelector
                                features={FEATURES}
                                selectedFeatures={value}
                                onFeaturesChange={onChange}
                            />
                        )}
                    />

                    {/* Description */}
                    <SectionHeader
                        icon={<FileText size={14} color="#3B82F6" />}
                        title="Description"
                    />

                    <View style={styles.card}>
                        <FormInput
                            control={control}
                            name="description"
                            label=""
                            placeholder="Describe your car in detail..."
                            multiline
                            numberOfLines={4}
                            style={styles.descriptionInput}
                        />
                    </View>

                    {/* Options */}
                    <SectionHeader
                        icon={<ShieldCheck size={14} color="#3B82F6" />}
                        title="Options"
                    />

                    <View style={styles.card}>
                        <Controller
                            control={control}
                            name="insuranceIncluded"
                            render={({ field: { value, onChange } }) => (
                                <OptionSwitch
                                    label="Insurance Included"
                                    subtitle="Full coverage available"
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
                                    label="Delivery Available"
                                    subtitle="Free delivery within city"
                                    value={value}
                                    onValueChange={onChange}
                                />
                            )}
                        />
                    </View>

                    {/* Submit */}
                    <View style={styles.submitSection}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={isLoading}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <AnimatedAddButton onPress={handleSubmit} isLoading={isLoading} />
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

    // Header
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
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },

    formContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Section header
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
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    // Card wrapper
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
        paddingTop: 4,
    },

    optionDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 4,
    },

    // Submit
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
        fontWeight: '700',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    submitButtonDisabled: {
        backgroundColor: '#64748B',
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
});