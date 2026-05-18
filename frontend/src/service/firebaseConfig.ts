import { getApps, initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDW7TL9JY7OYx0A-yEqzU2QMXMBl9CSa_k",
    appId: "1:648874206317:android:b5ef38caa538b44451cb64",
    projectId: "carapppush",
    messagingSenderId: "648874206317",
    databaseURL: "https://carapppush.firebaseio.com",
    storageBucket: "carapppush.firebasestorage.app"
};

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