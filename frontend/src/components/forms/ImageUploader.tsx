import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Upload, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageUploaderProps {
    images: ImagePicker.ImagePickerAsset[];
    onImagesChange: (images: ImagePicker.ImagePickerAsset[]) => void;
    maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
    const openGallery = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            alert("Permission denied");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            base64: false,
        });

        if (!result.canceled && result.assets.length > 0) {
            const selected = result.assets.slice(0, maxImages);
            onImagesChange(selected);
            console.log(`📸 Selected ${selected.length} images`);
        }
    };

    const removeImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Images</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={openGallery}>
                {images.length === 0 ? (
                    <>
                        <Upload size={24} color="#3B82F6" />
                        <Text style={styles.uploadText}>Upload Photos</Text>
                    </>
                ) : (
                    <View style={styles.imagesGrid}>
                        {images.map((img, i) => (
                            <View key={i} style={styles.imageWrapper}>
                                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(i)}
                                >
                                    <X size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
            {images.length > 0 && (
                <Text style={styles.imageCount}>
                    {images.length} / {maxImages} images selected
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    title: { fontSize: 16, fontWeight: "700", color: "#E2E8F0", marginBottom: 10 },
    uploadButton: {
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    uploadText: { color: "#3B82F6", fontSize: 14, fontWeight: "600", marginTop: 8 },
    imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: '100%' },
    imageWrapper: { position: "relative" },
    imagePreview: { width: 80, height: 80, borderRadius: 8 },
    removeButton: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
    },
    imageCount: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
});