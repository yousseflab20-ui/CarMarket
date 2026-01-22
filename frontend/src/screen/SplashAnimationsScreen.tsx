import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Video from "react-native-video";


export default function SplashAnimationsScreen() {
    return (
        <View style={styles.container}>


            <View style={styles.overlay}>
                <Text style={styles.logo}>🚗 CarMarket</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    video: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)"
    },
    logo: { color: "#fff", fontSize: 36, fontWeight: "bold" }
});
