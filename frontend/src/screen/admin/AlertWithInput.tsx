import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import { Edit } from "lucide-react-native";

export default function AlertWithInput() {
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Edit size={30} color="#0b0e14" />
            </TouchableOpacity>
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.alertContainer}>
                        <Text style={styles.title}>Enter something</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Type here..."
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ color: "#fff" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    alertContainer: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    title: { fontSize: 18, marginBottom: 15 },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#0b0e14",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
});