module.exports = {
  presets: ['module:metro-react-native-babel-preset', 'nativewind/babel'],
  plugins: [
    'react-native-reanimated/plugin',
    ['@babel/plugin-proposal-private-methods', { loose: true }],
  ],
};
