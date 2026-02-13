import * as Notifications from "expo-notifications";

export async function getPushToken() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        alert("Permission for notifications not granted!");
        return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log("Push Token:", tokenData.data);
    return tokenData.data;
}
