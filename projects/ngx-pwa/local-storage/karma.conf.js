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
      require('karma-safarinative-launcher'),
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
      dir: require('path').join(__dirname, '../../../coverage/ngx-pwa/local-storage'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromePrivate: {
        base: 'Chrome',
        flags: ['--incognito']
      },
      FirefoxPrivate: {
        base: 'Firefox',
        flags: ['--headless', '-private']
      },
      EdgePrivate: {
        base: 'Edge',
        flags: ['-private']
      },
      IEPrivate: {
        base: 'IE',
        flags: ['-private']
      }
    },
    /* Default */
    browsers: ['ChromeHeadless'],
    /* Tests on Mac */
    // browsers: ['ChromeHeadless', 'FirefoxHeadless', 'SafariNative'],
    /* Tests on Mac in private mode */
    // browsers: ['ChromePrivate', 'FirefoxPrivate', 'SafariPrivate'],
    /* Tests on Windows 10 */
    // browsers: ['Chrome', 'Firefox', 'Edge', 'IE'],
    /* Tests on Windows 10 in private mode (not sure the private option for Edge is working) */
    // browsers: ['ChromePrivate', 'FirefoxPrivate', 'EdgePrivate', 'IEPrivate'],
    singleRun: false,
    restartOnFileChange: true
  });
};
