import { View, Text, StatusBar, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";

export default function HomeScreen({ navigation }: any) {
    return (
        <ImageBackground
            source={require("../assets/image/image-CreeCompt.jpg")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

            <View style={styles.overlay}>
                <Text style={styles.title}>Car Market</Text>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SignUp")}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.signupButton]}
                        onPress={() => navigation.navigate("LoginUp")}
                    >
                        <Text style={styles.buttonText}>Créer un compte</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.33)",
        paddingVertical: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 40,
    },
    buttonsContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 40,
    },
    button: {
        backgroundColor: "#3134F8",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginVertical: 10,
        width: "80%",
        alignItems: "center",
    },
    signupButton: {
        backgroundColor: "#34C759",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
