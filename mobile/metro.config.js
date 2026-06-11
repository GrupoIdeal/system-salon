const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const config = getDefaultConfig(__dirname)

config.watchFolders = [
  path.resolve(__dirname, "../shared"),
  path.resolve(__dirname, "../server"),
]

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
]

config.resolver.extraNodeModules = {
  "@shared": path.resolve(__dirname, "../shared"),
  "@server": path.resolve(__dirname, "../server"),
}

module.exports = config
