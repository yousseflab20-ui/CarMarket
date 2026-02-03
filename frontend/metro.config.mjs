import { getDefaultConfig, mergeConfig } from '@react-native/metro-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    projectRoot: __dirname,
    watchFolders: [
        root
    ],
    resolver: {
        useWatchman: false,
        unstable_enableSymlinks: true,
        nodeModulesPaths: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(root, 'node_modules')
        ],
    },
};

export default mergeConfig(getDefaultConfig(__dirname), config);
