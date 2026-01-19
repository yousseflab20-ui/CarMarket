import { Text, View } from "react-native";
import { getAllCar } from "../../service/admin/endpoint.Car";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlatList } from "native-base";

export default function AdminCarScreen({ navigation }: any) {
    type Car = {
        id: number
        title: string
    }
    const { data: AllCar, error } = useQuery<Car[]>({
        queryKey: ["getAllCar"],
        queryFn: getAllCar
    })
    return (
        <View>
            <Text>Hello</Text>
            <FlatList
                data={AllCar}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text>{item.title}</Text>
                )}
            />
        </View>
    )
}