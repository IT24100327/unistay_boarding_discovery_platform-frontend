const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-maps ships .js files that contain JSX
// (e.g. node_modules/react-native-maps/lib/MapView.js line 347).
// Metro's default transformIgnorePatterns excludes all of node_modules, so
// those files never pass through Babel and the bundler throws
// "Unexpected token '<'".
// The regex below tells Metro to transform every node_modules package
// EXCEPT the ones in the non-capturing group — react-native-maps is added
// to that group so its JSX source gets compiled by babel-preset-expo.
config.transformer.transformIgnorePatterns = [
  /node_modules[/\\](?!(react-native|@react-native(-community)?|react-native-maps|expo(nent)?|@expo(nent)?\/.*|@unimodules\/.*|unimodules-|native-base|react-native-svg)\/).*/,
];

module.exports = config;
