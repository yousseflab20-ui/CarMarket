import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CarFront, Eye, EyeOff } from 'lucide-react-native';

export default function SignUp({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSignUp = () => {
        console.log("Email:", email, "Password:", password, "Confirm:", confirmPassword);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CarFront color="red" size={48} />
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join us to access our exclusive fleet</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Create a secure password"
                    placeholderTextColor="#888"
                    style={styles.inputWithIcon}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye color="#888" size={20} /> : <EyeOff color="#888" size={20} />}
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor="#888"
                    style={styles.inputWithIcon}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <Eye color="#888" size={20} /> : <EyeOff color="#888" size={20} />}
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                    <Text style={[styles.footerText, styles.loginText]}>Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        padding: 20,
        justifyContent: "center"
    },
    title: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "bold",
    },
    subtitle: {
        color: "#ccc",
        fontSize: 14,
        marginBottom: 30,
        textAlign: "center",
    },
    label: {
        color: "#fff",
        alignSelf: "flex-start",
        marginLeft: 10,
        marginTop: 10,
    },
    input: {
        width: "100%",
        backgroundColor: "#222",
        color: "#fff",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginTop: 5,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#222",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginTop: 5,
    },
    inputWithIcon: {
        flex: 1,
        color: "#fff",
        paddingVertical: 12,
    },
    button: {
        width: "100%",
        backgroundColor: "#3134F8",
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 25,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    footer: {
        flexDirection: "row",
        marginTop: 20,
    },
    footerText: {
        color: "#aaa",
        fontSize: 14,
    },
    loginText: {
        color: "#3134F8",
        fontWeight: "bold",
    },
});
