import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CarFront, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native';
import { loginUser } from "../service/authService";
import { Alert as NBAlert, VStack, HStack, IconButton, CloseIcon } from "native-base";

export default function LoginUp({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginStatus, setLoginStatus] = useState<{ status: "success" | "error"; title: string } | null>(null);

    const login = async () => {
        try {
            const valideLogin = await loginUser({ email, password });
            setLoginStatus({ status: "success", title: "Login successful!" });
            navigation.navigate("CarScreen");
        } catch (error: any) {
            setLoginStatus({ status: "error", title: error.message || "Login failed" });
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CarFront color="red" size={48} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Join us to access our exclusive fleet</Text>

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
                    placeholder="Enter your password"
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

            <View style={{ top: 19, width: "100%" }}>
                {loginStatus && (
                    <NBAlert w="100%" status={loginStatus.status} mb={3}>
                        <VStack space={2} flexShrink={1} w="100%">
                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                <HStack space={2} flexShrink={1}>
                                    <NBAlert.Icon mt="1" />
                                    <Text style={{ color: "#000", fontSize: 16 }}>
                                        {loginStatus.title}
                                    </Text>
                                </HStack>
                                <IconButton
                                    variant="unstyled"
                                    _focus={{ borderWidth: 0 }}
                                    icon={<CloseIcon size="3" />}
                                    _icon={{ color: "coolGray.600" }}
                                    onPress={() => setLoginStatus(null)}
                                />
                            </HStack>
                        </VStack>
                    </NBAlert>
                )}
            </View>

            <TouchableOpacity style={styles.button} onPress={login}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("login")}>
                    <Text style={[styles.footerText, styles.loginText]}>Sign Up</Text>
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
        padding: 5,
        backgroundColor: "#222",
        borderRadius: 8,
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
