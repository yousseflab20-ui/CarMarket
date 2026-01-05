import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CarFront, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react-native';
import API from "../api/axios"
import { setToken, getToken, removeToken } from '../service/storageToken';
export default function SignUp({ navigation }: any) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CarFront color="red" size={48} />
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join us to access our exclusive fleet</Text>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
                <User size={23} color="#fff" />
                <TextInput
                    placeholder="Enter your name"
                    placeholderTextColor="#888"
                    style={styles.inputWithIcon}
                    value={name}
                    onChangeText={setName}
                />
            </View>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
                <Mail size={23} color="#fff" />
                <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    style={styles.inputWithIcon}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
            </View>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
                <LockKeyhole size={23} color="#fff" />
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
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("LoginUp")}>
                    <Text style={[styles.footerText, styles.loginText]}>LoginUp</Text>
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
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#222",
        borderRadius: 8,
        padding: 5,
        paddingHorizontal: 15,
        marginTop: 5,
    },
    inputWithIcon: {
        flex: 1,
        color: "#fff",
        paddingVertical: 12,
        marginLeft: 10,
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
