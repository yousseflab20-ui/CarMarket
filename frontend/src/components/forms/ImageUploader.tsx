import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Upload, X } from 'lucide-react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import axios from 'axios';
import React, { useState } from 'react';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    error?: string;
    maxImages?: number;
}

export function ImageUploader({
    images,
    onImagesChange,
    error,
    maxImages = 10,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const openGallery = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: maxImages,
            quality: 1,
            includeBase64: false,
        });

        if (result.assets && result.assets.length > 0) {
            setUploading(true);
            const uploadedUrls: string[] = [];

            for (const asset of result.assets) {
                const url = await uploadImage(asset);
                if (url) uploadedUrls.push(url);
            }

            onImagesChange([...images, ...uploadedUrls]);
            setUploading(false);
        }
    };
    const CLOUD_NAME = 'diqv5fgon';
    const UPLOAD_PRESET = 'my_unsigned_preset';

    const uploadImage = async (image: Asset) => {
        const formData = new FormData();

        formData.append('file', {
            uri: image.uri!,
            name: image.fileName || `photo_${Date.now()}.jpg`,
            type: image.type || 'image/jpeg',
        } as any);

        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );

            console.log('Uploaded URL:', res.data.secure_url);

            return res.data.secure_url;

        } catch (err: any) {
            console.log('Cloudinary error:', err.response?.data || err.message);
            return null;
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
                disabled={uploading || images.length >= maxImages}
            >
                {uploading ? (
                    <ActivityIndicator color="#3B82F6" />
                ) : images.length === 0 ? (
                    <>
                        <Upload size={24} color="#3B82F6" />
                        <Text style={styles.uploadText}>Upload Photos</Text>
                        <Text style={styles.uploadHint}>Tap to select up to {maxImages} images</Text>
                    </>
                ) : (
                    <View style={styles.imagesGrid}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
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
    container: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#E2E8F0', marginBottom: 14 },
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
    uploadButtonError: { borderColor: '#EF4444' },
    uploadText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
    uploadHint: { color: '#64748B', fontSize: 12 },
    imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', padding: 10 },
    imageWrapper: { position: 'relative' },
    imagePreview: { width: 80, height: 80, borderRadius: 8 },
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
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 8, fontWeight: '500' },
});
