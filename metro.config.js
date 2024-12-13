const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname, {isCSSEnabled: true});

module.exports = withNativeWind(config, {input: './src/assets/css/global.css'});


// native wind docs https://nativewind.dev/docs/getting-started/installation
// const {getDefaultConfig} = require([
//   'expo/metro-config',
//   'react-native/metro-config',
// ]);
// const {withNativeWind} = require('nativewind/metro');

// const config = getDefaultConfig(__dirname, {isCSSEnabled: true});

// module.exports = withNativeWind(config, {input: './src/assets/css/global.css'});