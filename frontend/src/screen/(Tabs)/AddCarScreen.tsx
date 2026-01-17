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
import { ArrowLeft, Upload } from "lucide-react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { addCar } from "../../service/endpointService";
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
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleFeature = (feature: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const openGallery = async () => {
        const result = await launchImageLibrary({
            mediaType: "photo",
            selectionLimit: 10,
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            updateField("images", [...formData.images, ...result.assets]);
        }
    };

    const openCamera = async () => {
        const result = await launchCamera({
            mediaType: "photo",
            cameraType: "back",
            quality: 1,
            saveToPhotos: true,
        });

        if (result.assets && result.assets.length > 0) {
            updateField("images", [...formData.images, ...result.assets]);
        }
    };

    const handleAddCar = async () => {
        try {
            setLoading(true);

            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== "images") {
                    form.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
                }
            });

            formData.images.forEach((img, index) => {
                const newUri = Platform.OS === "android" ? img.uri : img.uri.replace("file://", "");
                form.append("photo", {
                    uri: newUri,
                    type: img.type || "image/jpeg",
                    name: img.fileName || `car_${index}.jpg`,
                } as any);
            });

            await addCar(form);
            Alert.alert("Success", "Car added successfully!");
            navigation.goBack();
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Car</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Images</Text>

                    <View style={{ gap: 12 }}>
                        <TouchableOpacity style={styles.uploadButton} onPress={openCamera}>
                            <Upload size={24} color="#22C55E" />
                            <Text style={[styles.uploadText, { color: "#22C55E" }]}>Take Photo (Camera)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.uploadButton} onPress={openGallery}>
                            <Upload size={24} color="#3B82F6" />
                            <Text style={styles.uploadText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        {formData.images.length > 0 && (
                            <View style={styles.imagesRow}>
                                {formData.images.map((img, index) => (
                                    <Image key={index} source={{ uri: img.uri }} style={styles.imagePreview} />
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <TextInput style={styles.input} placeholder="Car title" placeholderTextColor="#64748B"
                            value={formData.title} onChangeText={(v) => updateField("title", v)} />

                        <TextInput style={styles.input} placeholder="Brand" placeholderTextColor="#64748B"
                            value={formData.brand} onChangeText={(v) => updateField("brand", v)} />

                        <TextInput style={styles.input} placeholder="Model" placeholderTextColor="#64748B"
                            value={formData.model} onChangeText={(v) => updateField("model", v)} />

                        <TextInput style={styles.input} placeholder="Year" keyboardType="number-pad"
                            placeholderTextColor="#64748B" value={formData.year}
                            onChangeText={(v) => updateField("year", v)} />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleAddCar} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Car</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    scrollView: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
    formContainer: { padding: 16 },
    section: { marginTop: 20 },
    sectionTitle: { color: "#fff", fontSize: 16, marginBottom: 12 },
    input: { backgroundColor: "#1C1F26", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 10 },
    uploadButton: { borderWidth: 2, borderStyle: "dashed", borderColor: "#3B82F6", padding: 20, borderRadius: 12, alignItems: "center" },
    uploadText: { color: "#3B82F6", fontWeight: "600" },
    imagesRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
    imagePreview: { width: 100, height: 100, borderRadius: 10 },
    submitButton: { backgroundColor: "#3B82F6", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 20 },
    submitButtonText: { color: "#fff", fontWeight: "700" },
});
