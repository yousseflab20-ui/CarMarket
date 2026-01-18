// import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
// import { useEffect, useState } from "react";
// import { getFavorites, removeFavorite } from "../service/favorite/endpointfavorite";

// export default function FavoriteScreen() {
//     const [favorites, setFavorites] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const loadFavorites = async () => {
//         try {
//             setLoading(true);
//             const data = await getFavorites();
//             setFavorites(data.favorites || data);
//         } catch (err) {
//             console.log(err);
//             Alert.alert("Error", "Failed to load favorites");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadFavorites();
//     }, []);

//     const handleRemove = async (carId: number) => {
//         try {
//             await removeFavorite(carId);
//             setFavorites(prev => prev.filter(car => car.id !== carId));
//         } catch (err) {
//             Alert.alert("Error", "Failed to remove favorite");
//         }
//     };

//     if (loading) {
//         return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
//     }

//     return (
//         <View style={{ flex: 1, padding: 16, backgroundColor: "#0B0E14" }}>
//             <FlatList
//                 data={favorites}
//                 keyExtractor={(item) => item.id.toString()}
//                 ListEmptyComponent={<Text style={{ color: "white", textAlign: "center" }}>No favorites yet</Text>}
//                 renderItem={({ item }) => (
//                     <View style={{ backgroundColor: "#1C1F26", marginBottom: 12, borderRadius: 12, overflow: "hidden" }}>

//                         <Image
//                             source={{ uri: item.photo }
//                             style={{ width: "100%", height: 180 }}
//                         />

//                         <View style={{ padding: 12 }}>
//                             <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
//                                 {item.title}
//                             </Text>

//                             <Text style={{ color: "#94A3B8", marginVertical: 6 }}>
//                                 {item.brand} - {item.model}
//                             </Text>

//                             <TouchableOpacity
//                                 onPress={() => handleRemove(item.id)}
//                                 style={{ backgroundColor: "#EF4444", padding: 10, borderRadius: 8, marginTop: 8 }}
//                             >
//                                 <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
//                                     Remove from favorite
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 )}
//             />
//         </View>
//     );
// }
