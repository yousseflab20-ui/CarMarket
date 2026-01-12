import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CarDetailScreen({ navigation, route }: any) {
    const { car } = route.params;
    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: car.photo }} style={styles.carImage} />
            <View style={styles.info}>
                <Text style={styles.title}>{car.title}</Text>
                <Text style={styles.brand}>{car.brand}</Text>
                <Text style={styles.year}>Year: {car.year}</Text>
                <Text style={styles.speed}>Speed: {car.speed} mph</Text>
                <Text style={styles.seats}>Seats: {car.seats}</Text>
                <Text style={styles.price}>${car.pricePerDay} / Day</Text>
                <Text style={styles.description}>{car.description}</Text>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    carImage: { width: "100%", height: 250 },
    info: { padding: 20 },
    title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 8 },
    brand: { fontSize: 18, color: "#94A3B8", marginBottom: 8 },
    year: { fontSize: 16, color: "#fff", marginBottom: 4 },
    speed: { fontSize: 16, color: "#fff", marginBottom: 4 },
    seats: { fontSize: 16, color: "#fff", marginBottom: 4 },
    price: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 12 },
    description: { fontSize: 16, color: "#fff", lineHeight: 22 },
});