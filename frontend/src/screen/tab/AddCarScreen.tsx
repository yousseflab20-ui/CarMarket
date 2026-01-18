import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { ArrowLeft, Upload, X, Plus } from "lucide-react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context"
import { launchImageLibrary } from 'react-native-image-picker';
import { useAddCarMutation } from "../../service/car/mutations";
import { Platform } from "react-native";
interface CarFormData {
    title: string;
    brand: string;
    model: string;
    year: string;
    price: string;
    pricePerDay: string;
    speed: string;
    seats: string;
    mileage: string;
    transmission: string;
    fuelType: string;
    description: string;
    features: string[];
    images: any[];
    insuranceIncluded: boolean;
    deliveryAvailable: boolean;
}

const TRANSMISSIONS = ["Manual", "Automatic", "CVT"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];
const FEATURES = [
    "AC",
    "Leather Seats",
    "GPS",
    "Sunroof",
    "Backup Camera",
    "Bluetooth",
    "Cruise Control",
    "Heated Seats",
];

export default function AddCarScreen({ navigation }: any) {
    const [formData, setFormData] = useState<CarFormData>({
        title: "",
        brand: "",
        model: "",
        year: new Date().getFullYear().toString(),
        price: "",
        pricePerDay: "",
        speed: "",
        seats: "5",
        mileage: "0",
        transmission: "Automatic",
        fuelType: "Petrol",
        description: "",
        features: [],
        images: [],
        insuranceIncluded: true,
        deliveryAvailable: false,
    });

    const [loading, setLoading] = useState(false);

    const updateField = (field: keyof CarFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const toggleFeature = (feature: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };


    const addCarMutation = useAddCarMutation();

    const handleAddCar = async () => {
        setLoading(true);
        console.log("Images before upload:", formData.images);

        const form = new FormData();
        form.append("title", formData.title);
        form.append("brand", formData.brand);
        form.append("model", formData.model);
        form.append("year", formData.year);
        form.append("speed", formData.speed);
        form.append("seats", formData.seats);
        form.append("price", formData.price);
        form.append("pricePerDay", formData.pricePerDay);
        form.append("mileage", formData.mileage);
        form.append("description", formData.description);
        formData.images.forEach((img, index) => {
            const newUri =
                Platform.OS === "android" ? img.uri : img.uri.replace("file://", "");

            form.append("photo", {
                uri: newUri,
                type: img.type || "image/jpeg",
                name: img.fileName || `car_${index}.jpg`,
            } as any);
        });

        addCarMutation.mutate(form, {
            onSuccess: (data) => {
                console.log("✅ success:", data);
                Alert.alert("Success", "Car added");
                navigation.goBack();
            },
            onError: (err: any) => {
                console.log("🔥 SCREEN ERROR =", err);
                Alert.alert("Error", JSON.stringify(err?.response?.data || err.message));
            },
            onSettled: () => {
                setLoading(false);
            }
        });
    };
    const openGallery = async () => {
        const result = await launchImageLibrary({
            mediaType: "photo",
            selectionLimit: 10,
            quality: 1,
        });
        if (result.assets && result.assets.length > 0) {
            updateField("images", result.assets);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Car</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.formContainer}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Images</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={openGallery}>
                                {formData.images.length === 0 ? (
                                    <>
                                        <Upload size={24} color="#3B82F6" />
                                        <Text style={styles.uploadText}>Upload Photos</Text>
                                    </>
                                ) : (
                                    <View style={styles.imagesRow}>
                                        {formData.images.map((img, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: img.uri }}
                                                style={styles.imagePreview}
                                            />
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Car Title *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., BMW M4 2024"
                                placeholderTextColor="#64748B"
                                value={formData.title}
                                onChangeText={(value) =>
                                    updateField("title", value)
                                }
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Brand *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="BMW"
                                    placeholderTextColor="#64748B"
                                    value={formData.brand}
                                    onChangeText={(value) =>
                                        updateField("brand", value)
                                    }
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Model *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="M4"
                                    placeholderTextColor="#64748B"
                                    value={formData.model}
                                    onChangeText={(value) =>
                                        updateField("model", value)
                                    }
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Year *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2024"
                                    placeholderTextColor="#64748B"
                                    keyboardType="number-pad"
                                    value={formData.year}
                                    onChangeText={(value) =>
                                        updateField("year", value)
                                    }
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Mileage (km)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor="#64748B"
                                    keyboardType="number-pad"
                                    value={formData.mileage}
                                    onChangeText={(value) =>
                                        updateField("mileage", value)
                                    }
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Specifications</Text>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Speed (mph)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="180"
                                    placeholderTextColor="#64748B"
                                    keyboardType="number-pad"
                                    value={formData.speed}
                                    onChangeText={(value) =>
                                        updateField("speed", value)
                                    }
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Seats</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="5"
                                    placeholderTextColor="#64748B"
                                    keyboardType="number-pad"
                                    value={formData.seats}
                                    onChangeText={(value) =>
                                        updateField("seats", value)
                                    }
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Transmission</Text>
                                <View style={styles.selectContainer}>
                                    <Text style={styles.selectText}>
                                        {formData.transmission}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Fuel Type</Text>
                                <View style={styles.selectContainer}>
                                    <Text style={styles.selectText}>
                                        {formData.fuelType}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pricing</Text>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Total Price ($) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="45000"
                                    placeholderTextColor="#64748B"
                                    keyboardType="number-pad"
                                    value={formData.price}
                                    onChangeText={(value) =>
                                        updateField("price", value)
                                    }
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Price/Day ($) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="200"
                                    placeholderTextColor="#64748B"
                                    keyboardType="number-pad"
                                    value={formData.pricePerDay}
                                    onChangeText={(value) =>
                                        updateField("pricePerDay", value)
                                    }
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Features</Text>
                        <View style={styles.featuresGrid}>
                            {FEATURES.map((feature) => (
                                <TouchableOpacity
                                    key={feature}
                                    style={[
                                        styles.featureButton,
                                        formData.features.includes(feature) &&
                                        styles.featureButtonActive,
                                    ]}
                                    onPress={() => toggleFeature(feature)}
                                >
                                    <Text
                                        style={[
                                            styles.featureText,
                                            formData.features.includes(feature) &&
                                            styles.featureTextActive,
                                        ]}
                                    >
                                        {feature}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Describe your car in detail..."
                            placeholderTextColor="#64748B"
                            multiline
                            numberOfLines={4}
                            value={formData.description}
                            onChangeText={(value) =>
                                updateField("description", value)
                            }
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Options</Text>

                        <View style={styles.optionRow}>
                            <View>
                                <Text style={styles.optionLabel}>
                                    Insurance Included
                                </Text>
                                <Text style={styles.optionSubtitle}>
                                    Full coverage available
                                </Text>
                            </View>
                            <Switch
                                value={formData.insuranceIncluded}
                                onValueChange={(value) =>
                                    updateField("insuranceIncluded", value)
                                }
                                thumbColor={
                                    formData.insuranceIncluded
                                        ? "#3B82F6"
                                        : "#64748B"
                                }
                                trackColor={{
                                    false: "#2D3545",
                                    true: "#1E293B",
                                }}
                            />
                        </View>
                        <View style={styles.optionRow}>
                            <View>
                                <Text style={styles.optionLabel}>
                                    Delivery Available
                                </Text>
                                <Text style={styles.optionSubtitle}>
                                    Free delivery within city
                                </Text>
                            </View>
                            <Switch
                                value={formData.deliveryAvailable}
                                onValueChange={(value) =>
                                    updateField("deliveryAvailable", value)
                                }
                                thumbColor={
                                    formData.deliveryAvailable
                                        ? "#3B82F6"
                                        : "#64748B"
                                }
                                trackColor={{
                                    false: "#2D3545",
                                    true: "#1E293B",
                                }}
                            />
                        </View>
                    </View>
                    <View style={styles.submitSection}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                loading && styles.submitButtonDisabled,
                            ]}
                            onPress={handleAddCar}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    Add Car
                                </Text>
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
        backgroundColor: "#0B0E14",
    },
    scrollView: {
        flex: 1,
        bottom: 30,

    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    formContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#E2E8F0",
        marginBottom: 14,
    },
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#94A3B8",
        marginBottom: 8,
    },
    imagesRow: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    input: {
        backgroundColor: "#1C1F26",
        borderWidth: 1,
        borderColor: "#2D3545",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#E2E8F0",
        fontSize: 14,
        fontWeight: "500",
    },
    descriptionInput: {
        minHeight: 100,
        textAlignVertical: "top",
        paddingTop: 12,
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },

    selectContainer: {
        backgroundColor: "#1C1F26",
        borderWidth: 1,
        borderColor: "#2D3545",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        justifyContent: "center",
    },
    selectText: {
        color: "#E2E8F0",
        fontSize: 14,
        fontWeight: "500",
    },
    featuresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    featureButton: {
        backgroundColor: "#1C1F26",
        borderWidth: 1.5,
        borderColor: "#2D3545",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: "48%",
    },
    featureButtonActive: {
        backgroundColor: "#3B82F6",
        borderColor: "#3B82F6",
    },
    featureText: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
    featureTextActive: {
        color: "#fff",
    },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1C1F26",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#2D3545",
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#E2E8F0",
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
    uploadButton: {
        backgroundColor: "#1C1F26",
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 30,
        alignItems: "center",
        gap: 10,
    },
    uploadText: {
        color: "#3B82F6",
        fontSize: 14,
        fontWeight: "600",
    },
    submitSection: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#3B82F6",
        fontSize: 15,
        fontWeight: "700",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    submitButtonDisabled: {
        backgroundColor: "#64748B",
        opacity: 0.6,
    },
});