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
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../../coverage/ngx-pwa/local-storage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
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
      }
    },
    /* Default */
    browsers: ['ChromeHeadless'],
    /* Tests on Mac */
    // browsers: ['ChromeHeadless', 'FirefoxHeadless', 'SafariNative'],
    /* Tests on Mac in private mode */
    // browsers: ['ChromePrivate', 'FirefoxPrivate', 'SafariPrivate'],
    /* Tests on Windows */
    // browsers: ['Chrome', 'Firefox', 'Edge'],
    /* Tests on Windows in private mode (not sure the private option for Edge is working) */
    // browsers: ['ChromePrivate', 'FirefoxPrivate', 'EdgePrivate'],
    singleRun: false,
    restartOnFileChange: true
  });
};
