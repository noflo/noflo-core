/* eslint import/no-extraneous-dependencies: ["error", {"peerDependencies": true}] */
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  const files = [
    {
      pattern: 'browser/noflo-core.js',
      included: true,
      served: true,
    },
    'spec/*.js',
  ];

  const configuration = {
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files,
    exclude: [],
    preprocessors: {},
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome_without_security'],
    customLaunchers: {
      Chrome_without_security: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    singleRun: true,
    concurrency: Infinity,
  };

  config.set(configuration);
};
