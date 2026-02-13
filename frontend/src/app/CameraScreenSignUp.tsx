import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, CameraType, Camera } from "expo-camera";
import { useRouter } from "expo-router";

export default function CameraScreen() {
    const cameraRef = useRef<CameraView | null>(null);
    const router = useRouter();

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

        router.push({
            pathname: "/SignUpScreen",
            params: { photo: photo.uri },
        });
    };

    if (hasPermission === null) {
        return <Text>Requesting camera permission...</Text>;
    }

    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
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
                    onPress={() => router.back()}
                >
                    <Text style={{ color: "white" }}>Close</Text>
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
