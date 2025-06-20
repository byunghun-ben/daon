const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Include the workspace root for pnpm workspaces
    path.resolve(__dirname, "../../"),
  ],
  resolver: {
    // Follow symlinks for pnpm
    unstable_enableSymlinks: true,
    // Add node_modules paths for proper resolution
    nodeModulesPaths: [
      path.resolve(__dirname, "./node_modules"),
      path.resolve(__dirname, "../../node_modules"),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
