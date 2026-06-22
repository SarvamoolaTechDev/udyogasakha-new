const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro can resolve shared/hoisted packages correctly
config.watchFolders = [workspaceRoot];

// Look for modules in both the app's own node_modules and the workspace root's —
// this is what prevents Metro from accidentally bundling two different copies
// of react-native (one hoisted to root, one nested under a dependency).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force Metro to resolve react-native and expo from a single source of truth
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
