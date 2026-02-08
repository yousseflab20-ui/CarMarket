import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Upload, X } from 'lucide-react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

interface ImageUploaderProps {
    images: Asset[];
    onImagesChange: (images: Asset[]) => void;
    error?: string;
    maxImages?: number;
}

export function ImageUploader({
    images,
    onImagesChange,
    error,
    maxImages = 10,
}: ImageUploaderProps) {
    const openGallery = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: maxImages,
            quality: 1,
            includeBase64: true,
        });
        if (result.assets && result.assets.length > 0) {
            onImagesChange(result.assets);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Images</Text>
            <TouchableOpacity
                style={[styles.uploadButton, error && styles.uploadButtonError]}
                onPress={openGallery}
            >
                {images.length === 0 ? (
                    <>
                        <Upload size={24} color="#3B82F6" />
                        <Text style={styles.uploadText}>Upload Photos</Text>
                        <Text style={styles.uploadHint}>Tap to select up to {maxImages} images</Text>
                    </>
                ) : (
                    <View style={styles.imagesGrid}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: img.uri }}
                                    style={styles.imagePreview}
                                />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <X size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E2E8F0',
        marginBottom: 14,
    },
    uploadButton: {
        backgroundColor: '#1C1F26',
        borderWidth: 2,
        borderColor: '#3B82F6',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 30,
        alignItems: 'center',
        gap: 8,
    },
    uploadButtonError: {
        borderColor: '#EF4444',
    },
    uploadText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    uploadHint: {
        color: '#64748B',
        fontSize: 12,
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        padding: 10,
    },
    imageWrapper: {
        position: 'relative',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
    },
});