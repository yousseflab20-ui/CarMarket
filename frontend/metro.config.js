// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly set the project root to the current directory (frontend)
config.projectRoot = __dirname;

// Only watch the frontend directory to avoid issues with the root node_modules if it doesn't exist
config.watchFolders = [__dirname];

module.exports = config;
