import { getApps, initializeApp } from '@react-native-firebase/app';
import { firebaseConfig } from '../constant/firebaseConfig';

export const initFirebase = () => {
    if (getApps().length === 0) {
        if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
            console.error('❌ Firebase Configuration is missing! Config:', firebaseConfig);
            return;
        }

        console.log('🔥 Initializing Firebase...');
        console.log('Config:', {
            projectId: firebaseConfig.projectId,
            apiKey: firebaseConfig.apiKey ? '✓' : '✗',
            appId: firebaseConfig.appId ? '✓' : '✗'
        });
        try {
            initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
        }
    }
};
initFirebase();