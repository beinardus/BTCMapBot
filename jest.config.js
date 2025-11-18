import currentModulePaths from "current-module-paths";
const { __dirname } = currentModulePaths(import.meta.url);

export default {
  projects: [
    {
      displayName: "btcmap-common",
      rootDir: `${__dirname}/btcmap-common`,
      setupFiles: [`${__dirname}/setupTests.js`],
      globals: {
        __ROOT_DIR__: `${__dirname}/btcmap-common`
      },
    },
    {
      displayName: "btcmap-database",
      rootDir: `${__dirname}/btcmap-database`,
      setupFiles: [`${__dirname}/setupTests.js`],
      globals: {
        __ROOT_DIR__: `${__dirname}/btcmap-database`
      },
    },
    {
      displayName: "btcmap-osm",
      rootDir: `${__dirname}/btcmap-osm`,
      setupFiles: [`${__dirname}/setupTests.js`],
      globals: {
        __ROOT_DIR__: `${__dirname}/btcmap-osm`
      },
    },
    {
      displayName: "btcmap-telegram",
      rootDir: `${__dirname}/btcmap-telegram`,
      setupFiles: [`${__dirname}/setupTests.js`],
      globals: {
        __ROOT_DIR__: `${__dirname}/btcmap-telegram`
      },
      transformIgnorePatterns: [
        "node_modules/(?!telegram-format/.*)"
      ]
    },
    {
      displayName: "btcmap-nominatim-proxy",
      rootDir: `${__dirname}/btcmap-nominatim-proxy`,
      setupFiles: [`${__dirname}/setupTests.js`],
      globals: {
        __ROOT_DIR__: `${__dirname}/btcmap-nominatim-proxy`
      },
    },
    {
      displayName: "btcmap-jsonata",
      rootDir: `${__dirname}/btcmap-jsonata`,
      setupFiles: [`${__dirname}/setupTests.js`],
      globals: {
        __ROOT_DIR__: `${__dirname}/btcmap-jsonata`
      },
    },
  ],
};