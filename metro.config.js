const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-maps (and some other packages) reference their TypeScript/JSX
// source files via the "react-native" field in package.json.  Metro resolves
// those source files but, by default, skips Babel for *all* node_modules
// whose path matches the built-in blockList.  Explicitly extending the list of
// source extensions and pointing the Babel transformer at the project's own
// babel.config.js guarantees that every .ts/.tsx/.jsx file inside node_modules
// is transpiled through babel-preset-expo — eliminating the
// "Unexpected token '<'" parse error.
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

config.resolver = {
  ...resolver,
  sourceExts: [...(resolver.sourceExts ?? []), 'cjs', 'mjs'],
};

module.exports = config;
