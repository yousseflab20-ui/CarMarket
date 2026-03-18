import { View, StyleSheet, Text } from 'react-native';
import { ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG, ONE_ON_ONE_VOICE_CALL_CONFIG } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { APP_ID, APP_SIGN } from '../constant/ZegoConfig';
import { useAuthStore } from '../store/authStore';

export default function CallScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const callID = params.callID as string;
    const isVideoCall = params.isVideoCall === 'true';

    console.log("CallScreen Params:", { callID, isVideoCall, userID: user?.id, userName: user?.name });
    console.log("ZegoConfig:", { APP_ID: APP_ID ? "Present" : "Missing", APP_SIGN: APP_SIGN ? "Present" : "Missing" });

    if (!user || !callID) {
        console.warn("Missing user or callID, redirecting back...");
        return (
            <View style={styles.container}>
                <Text style={{ color: 'red' }}>Error: Missing call data</Text>
            </View>
        );
    }

    if (!APP_ID || !APP_SIGN) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'red' }}>Error: ZegoConfig not set</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ZegoUIKitPrebuiltCall
                appID={Number(APP_ID)}
                appSign={String(APP_SIGN)}
                userID={String(user.id)}
                userName={String(user.name)}
                callID={String(callID)}
                config={{
                    ...(isVideoCall ? ONE_ON_ONE_VIDEO_CALL_CONFIG : ONE_ON_ONE_VOICE_CALL_CONFIG),
                    onHangUp: () => {
                        console.log("Call Ended");
                        router.back();
                    },
                    bottomMenuBarConfig: {
                        buttons: isVideoCall ? [0, 1, 2, 3, 4] : [1, 2, 3],
                        hideAutomatically: false,
                    },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
});
