import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { APP_ID, APP_SIGN } from '../constant/ZegoConfig';

class ZegoCallService {
    private static instance: ZegoCallService;

    private constructor() { }

    public static getInstance(): ZegoCallService {
        if (!ZegoCallService.instance) {
            ZegoCallService.instance = new ZegoCallService();
        }
        return ZegoCallService.instance;
    }

    public init(userId: string, userName: string) {
        ZegoUIKitPrebuiltCallService.init(
            APP_ID,
            APP_SIGN,
            userId,
            userName,
            [], // plugins
            {
                ringtoneConfig: {
                    incomingCallRingtone: 'zego_incoming',
                    outgoingCallRingtone: 'zego_outgoing',
                },
            }
        );
    }

    public unInit() {
        ZegoUIKitPrebuiltCallService.uninit();
    }
}

export default ZegoCallService;
