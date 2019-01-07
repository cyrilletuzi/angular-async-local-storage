// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-safari-launcher'),
      require('karma-safari-private-launcher'),
      require('karma-edge-launcher'),
      require('karma-ie-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      Chrome_private: {
        base: 'Chrome',
        flags: ['--incognito']
      },
      Firefox_private: {
        base: 'Firefox',
        flags: ['-private']
      },
      Edge_private: {
        base: 'Edge',
        flags: ['-private']
      },
      IE_private: {
        base: 'IE',
        flags: ['-private']
      }
    },
    /* Quick tests */
    // browsers: ['Chrome'],
    /* Tests on Mac
     * There is currently an issue with karma and Safari 12,
     * needing to explicitly click "open" to launch the tests
     */
    browsers: ['Chrome', 'Firefox', 'Safari'],
    /* Tests on Mac in private modes */
    // browsers: ['Chrome_private', 'Firefox_private', 'SafariPrivate'],
    /* Tests on Windows */
    // browsers: ['Chrome', 'Firefox', 'Edge', 'IE'],
    /* Tests on Windows in private mode
     * Not sure the private option for Edge is working... */
    // browsers: ['Chrome', 'Chrome_private', 'Firefox_private', 'Edge_private', 'IE_private'],
    singleRun: false
  });
};
