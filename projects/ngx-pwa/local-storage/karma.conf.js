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
    browsers: ['Chrome'],
    /* Tests on Mac
     * IMPORTANT FOR SAFARI: by default, Safari reopens previous tabs, meaning there can be multiple instances of the same tests running at the same time,
     * which leads some tests to crash because of asynchronicty. To avoid this, manually close all Karma tabs in Safari, or run in the terminal:
     * defaults write com.apple.Safari ApplePersistenceIgnoreState YES
     */
    // browsers: ['Chrome', 'Firefox', 'Safari', 'Chrome_private'],
    /* Tests on Mac in private modes
     * IMPORTANT : Safari does not have a command line option for private mode (if you know one, please tell me),
     * so you have to manually configure it to open a new private tab on launch, before launching the tests */
    // browsers: ['Chrome', 'Chrome_private', 'Firefox_private', 'Safari'],
    /* Tests on Windows */
    // browsers: ['Chrome', 'Firefox', 'Edge', 'IE'],
    /* Tests on Windows in private mode
     * Not sure the private option for Edge is working... */
    // browsers: ['Chrome', 'Chrome_private', 'Firefox_private', 'Edge_private', 'IE_private'],
    singleRun: false
  });
};
