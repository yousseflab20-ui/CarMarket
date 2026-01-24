/**
 * @format
 */

import { AppRegistry, BackHandler } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventName, handler) => {
    console.warn(
      'BackHandler.removeEventListener is deprecated. Use .remove() on the subscription instead.',
    );
  };
}

AppRegistry.registerComponent(appName, () => App);
