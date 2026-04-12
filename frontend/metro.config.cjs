const { createRequire } = require('module');
const { getDefaultConfig } = require('expo/metro-config');

// createRequire(__filename) helps pnpm resolve nested packages from this file's context
const requireConfig = createRequire(__filename);
const { withUniwindConfig } = requireConfig('uniwind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.projectRoot = __dirname;
config.watchFolders = [__dirname];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
