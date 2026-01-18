/**
 * AddCarScreen
 * 
 * Screen for adding a new car listing.
 * Uses react-hook-form with zod validation and modular form components.
 */

import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';

import { useCarForm } from '../../hooks/useCarForm';
import { FEATURES, TRANSMISSIONS, FUEL_TYPES } from '../../schemas/carFormSchema';
import { FormInput } from '../../components/forms/FormInput';
import { ImageUploader } from '../../components/forms/ImageUploader';
import { FeatureSelector } from '../../components/forms/FeatureSelector';
import { OptionSwitch } from '../../components/forms/OptionSwitch';
import { SelectField } from '../../components/forms/SelectField';

export default function AddCarScreen({ navigation }: any) {
    const { form, images, setImages, handleSubmit, isLoading } = useCarForm({
        onSuccess: () => navigation.goBack(),
    });

    const { control, watch, setValue } = form;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Car</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.formContainer}>
                    {/* Images Section */}
                    <ImageUploader
                        images={images}
                        onImagesChange={setImages}
                    />

                    {/* Basic Information */}
                    <Text style={styles.sectionTitle}>Basic Information</Text>

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

                    {/* Specifications */}
                    <Text style={styles.sectionTitle}>Specifications</Text>

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

                    {/* Pricing */}
                    <Text style={styles.sectionTitle}>Pricing</Text>

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
                    <Text style={styles.sectionTitle}>Description</Text>
                    <FormInput
                        control={control}
                        name="description"
                        label=""
                        placeholder="Describe your car in detail..."
                        multiline
                        numberOfLines={4}
                        style={styles.descriptionInput}
                    />

                    {/* Options */}
                    <Text style={styles.sectionTitle}>Options</Text>

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

                    {/* Submit Buttons */}
                    <View style={styles.submitSection}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Car</Text>
                            )}
                        </TouchableOpacity>
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
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    formContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E2E8F0',
        marginBottom: 14,
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
    },
    descriptionInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        color: "#fff",
        paddingTop: 12,
    },
    submitSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#3B82F6',
        fontSize: 15,
        fontWeight: '700',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    submitButtonDisabled: {
        backgroundColor: '#64748B',
        opacity: 0.6,
    },
});