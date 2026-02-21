module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for Reanimated 3+ (and especially 4.x)
            'react-native-reanimated/plugin',
        ],
    };
};
