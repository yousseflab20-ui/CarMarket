import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";

export default function CameraScreenSignUp({ navigation }: any) {
    const camera = useRef<Camera>(null);
    const devices = useCameraDevices();
    const frontDevice = devices.find(d => d.position === "front");

    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === "granted");
        })();
    }, []);

    const takePhoto = async () => {
        if (camera.current) {
            const snap = await camera.current.takePhoto({ flash: "off" });
            const photoPath = "file://" + snap.path;
            navigation.navigate("SignUpScreen", { photo: photoPath });
        }
    };

    if (!frontDevice) return <Text>Loading camera...</Text>;
    if (!hasPermission) return <Text>No camera permission</Text>;

    return (
        <View style={StyleSheet.absoluteFill}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={frontDevice}
                isActive={true}
                photo={true}
            />

            <View style={cameraStyles.controls}>
                <TouchableOpacity onPress={takePhoto} style={cameraStyles.captureButton} />
                <TouchableOpacity onPress={() => navigation.goBack()} style={cameraStyles.closeButton}>
                    <Text style={{ color: "white" }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const cameraStyles = StyleSheet.create({
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
