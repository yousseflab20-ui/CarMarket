import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import { ImageUploaderProps } from '../../types/components/forms';

export function ImageUploader({ images, onImagesChange, maxImages = 4 }: ImageUploaderProps) {
    const { t } = useTranslation();
    const openGallery = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert(t('addCar.error'), t('verification.alerts.permissionDenied'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            base64: false,
        });

        if (!result.canceled && result.assets.length > 0) {
            const remainingSlots = maxImages - images.length;

            if (remainingSlots <= 0) {
                Alert.alert(t('addCar.error'), t('addCar.alerts.maxImages', { max: maxImages }));
                return;
            }

            const selected = result.assets.slice(0, remainingSlots);

            onImagesChange([...images, ...selected]);

            if (result.assets.length > remainingSlots) {
                Alert.alert(t('addCar.error'), t('addCar.alerts.onlySomeImages', { count: remainingSlots, max: maxImages }));
            }
        }
    };

    const removeImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <View className="mb-5">
            <Text className="text-base text-slate-200 mb-2.5" style={{ fontFamily: "Lexend_700Bold" }}>
                {t('addCar.uploadPhotos')}
            </Text>
            <TouchableOpacity 
                className="border-2 border-blue-500 border-dashed rounded-xl p-5 items-center" 
                onPress={openGallery} 
                disabled={images.length >= maxImages}
            >
                {images.length === 0 ? (
                    <>
                        <Upload size={24} color="#3B82F6" />
                        <Text className="text-blue-500 text-sm mt-2" style={{ fontFamily: "Lexend_600SemiBold" }}>
                            {t('addCar.uploadSub', { max: maxImages })}
                        </Text>
                    </>
                ) : (
                    <View className="flex-row flex-wrap gap-2.5 w-full">
                        {images.map((img, i) => (
                            <View key={i} className="relative">
                                <Image source={{ uri: img.uri }} className="w-20 h-20 rounded-lg" />
                                <TouchableOpacity
                                    className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-red-500 justify-center items-center"
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
                <Text className="text-slate-400 text-xs mt-2 text-center" style={{ fontFamily: 'Lexend_400Regular' }}>
                    {t('addCar.imagesSelected', { count: images.length, max: maxImages })}
                </Text>
            )}
        </View>
    );
}