import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { router } from 'expo-router';

// Helper to send a call invitation to a remote user
export type CallParams = {
    callID: string;
    targetUserID: string;
    targetUserName: string;
    isVideoCall: boolean;
};

export function sendCallInvitation({ targetUserID, targetUserName, isVideoCall }: CallParams) {
    const invitees = [{ userID: targetUserID, userName: targetUserName }];
    const navigation = { navigate: (name: string, params?: any) => router.push({ pathname: name, params }) };

    ZegoUIKitPrebuiltCallService.sendCallInvitation(
        invitees,
        isVideoCall,
        navigation as any,
        {}
    );
}

export default ZegoUIKitPrebuiltCallService;
