import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, CameraType, Camera } from "expo-camera";
import { useTranslation } from "react-i18next";

interface CameraScreenSignUpProps {
    onClose: () => void;
    onPhotoTaken: (uri: string) => void;
}

export default function CameraScreenSignUp({ onClose, onPhotoTaken }: CameraScreenSignUpProps) {
    const { t } = useTranslation();
    const cameraRef = useRef<CameraView | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [type, setType] = useState<CameraType>("front");

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    const takePhoto = async () => {
        if (!cameraRef.current) return;

        const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
        });

        onPhotoTaken(photo.uri);
    };

    if (hasPermission === null) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.permissionText}>{t('camera.requestingPermission')}</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.permissionText}>{t('camera.noAccess')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={type}
            />

            <View style={styles.controls}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto} />

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Text style={{ color: "white", fontFamily: 'Lexend_600SemiBold' }}>{t('camera.close')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    permissionText: {
        color: "white",
        fontSize: 16,
        fontFamily: 'Lexend_400Regular',
        textAlign: "center",
    },
    controls: {
        position: "absolute",
        bottom: 50,
        width: "100%",
        alignItems: "center",
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "white",
        marginBottom: 15,
    },
    closeButton: {
        padding: 10,
        backgroundColor: "red",
        borderRadius: 10,
    },
});
