import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, Text, Easing } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashCarScreen({ navigation }: any) {
    const carX = useRef(new Animated.Value(-width)).current;
    const carScale = useRef(new Animated.Value(0.7)).current;
    const carBounce = useRef(new Animated.Value(1)).current;

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const sloganAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(carX, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(carScale, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(carBounce, {
                    toValue: 1.05,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(carBounce, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(sloganAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setTimeout(() => {
                navigation.replace("TabNavigator");
            }, 2000);
        });
    }, []);

    return (
        <View style={styles.container}>
            <Animated.Image
                source={{
                    uri: "https://i.pinimg.com/1200x/14/be/07/14be075d5f0f3c3a78ba2274a174f4dd.jpg",
                }}
                style={[
                    styles.car,
                    {
                        transform: [
                            { translateX: carX },
                            { scale: Animated.multiply(carScale, carBounce) },
                        ],
                    },
                ]}
                resizeMode="cover"
            />
            <View style={styles.overlay} />
            <Animated.Text style={[styles.logo, { opacity: logoOpacity }]}>
                CarMarket
            </Animated.Text>
            <Animated.Text
                style={[
                    styles.slogan,
                    {
                        opacity: sloganAnim,
                        transform: [
                            {
                                translateY: sloganAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                Find your dream car
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
        justifyContent: "center",
        alignItems: "center",
    },
    car: {
        position: "absolute",
        width: width,
        height: height,
    },
    overlay: {
        position: "absolute",
        width: width,
        height: height,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    logo: {
        fontSize: 42,
        fontWeight: "bold",
        color: "white",
        letterSpacing: 2,
        textAlign: "center",
    },
    slogan: {
        marginTop: 10,
        fontSize: 16,
        color: "#ccc",
        textAlign: "center",
        letterSpacing: 1,
    },
});
