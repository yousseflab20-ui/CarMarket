import { View, StatusBar, Text, FlatList, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { AllCar } from "../service/endpointService"
import { useEffect } from "react";

export default function CarScreen({ navigation }: any) {
    const { data: cars, isLoading, isError, error } = useQuery({
        queryKey: ["cars"],
        queryFn: AllCar,
    });
    useEffect(() => {
        console.log("cars from useQuery:", cars);
    }, [cars]);

    console.log("isLoading:", isLoading);
    console.log("isError:", isError);
    console.log("error:", error);
    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error: {error.message}</Text>;
    return (
        <SafeAreaView>
            <View>
            </View>
            <FlatList
                data={cars}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>

                        <Image
                            source={{ uri: item.photo }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <Text>{item.title}</Text>
                        <Text>{item.price}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    card: {
        margin: 10,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        elevation: 2,
    },
    image: {
        width: "100%",
        height: 200,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        margin: 5,
    },
    color: {
        fontSize: 16,
        margin: 5,
    },
});