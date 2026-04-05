import * as Location from "expo-location";

export const handleSendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
        alert("Permission denied");
        return;
    }

    const location = await Location.getCurrentPositionAsync({});

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    console.log(latitude, longitude);

};
