// CRITICAL: Must be imported FIRST — registers Firebase background message handler
// in the headless JS context (when app is killed and a call notification arrives).
// ⚠️  This file must stay MINIMAL (no zustand, no axios, no socket).
import './firebaseBackground';

// expo-router/entry handles registerRootComponent and all routing setup.
import 'expo-router/entry';

