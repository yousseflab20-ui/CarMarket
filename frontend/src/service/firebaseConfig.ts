import { getApps, initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
};

export const initFirebase = () => {
    if (getApps().length === 0) {
        if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
            console.error('❌ Firebase Configuration is missing! Check your .env file.');
            return;
        }

        console.log('🔥 Initializing Firebase...');
        try {
            initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
        }// Call initialization immediately when module is imported
    }
};
initFirebase();