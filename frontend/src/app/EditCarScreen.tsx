import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getCarById } from "../service/car/api"
export default function EditCarScreen() {
    const { id } = useLocalSearchParams()
    const { data: car, isLoading } = useQuery({
        queryKey: ["car", id],
        queryFn: () => getCarById(id),
    })

    useEffect(() => {
        if (car) {
            console.log("CAR DATA:", car);
        }
    }, [car]);
    console.log("log data car", car)
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    return (
        <SafeAreaView>
            <View>
                <Text>{id}</Text>
            </View>
        </SafeAreaView>
    )
}