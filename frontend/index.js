/**
 * @format
 */

import { AppRegistry, BackHandler } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Polyfill for deprecated BackHandler methods (needed for native-base with RN 0.83+)
if (!BackHandler.removeEventListener) {
    BackHandler.removeEventListener = (eventName, handler) => {
        // The new API doesn't have removeEventListener, but the BackHandler
        // subscription returned from addEventListener has a remove() method
        // This is a no-op polyfill since the proper way is to call .remove() on subscription
        console.warn('BackHandler.removeEventListener is deprecated. Use .remove() on the subscription instead.');
    };
}

AppRegistry.registerComponent(appName, () => App);

