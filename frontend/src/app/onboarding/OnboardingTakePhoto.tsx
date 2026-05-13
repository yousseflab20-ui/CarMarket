import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { useState } from "react";
import { onboardingData } from "./onboardingData";

export default function OnboardingTakePhoto() {
    const [index, setIndex] = useState(0);

    const current = onboardingData[index];

    const goNext = () => {
        if (index < onboardingData.length - 1) {
            setIndex(index + 1);
        }
    };

    const goPrev = () => {
        if (index > 0) {
            setIndex(index - 1);
        }
    };

    return (
        <ImageBackground
            source={current.image}
            style={{ flex: 1 }}
            resizeMode="cover"
            imageStyle={{ resizeMode: "cover", alignSelf: "center" }}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{current.title}</Text>
                <Text style={styles.desc}>{current.description}</Text>

                <View style={{ flexDirection: "row", gap: 20 }}>
                    <TouchableOpacity onPress={goPrev}>
                        <Text style={{ color: "white" }}>Left</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goNext}>
                        <Text style={{ color: "white" }}>
                            {current.buttonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})