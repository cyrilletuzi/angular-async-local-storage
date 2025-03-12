// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-firefox-launcher"),
      require("karma-safarinative-launcher"),
      require("karma-safari-private-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
    ],
    /*
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
    },
    */
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: path.join(workspaceRoot, "coverage", coverageFolderName),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },
    reporters: ["progress", "kjhtml"],
    customLaunchers: {
      ChromePrivate: {
        base: "Chrome",
        flags: ["--incognito"]
      },
      FirefoxPrivate: {
        base: "Firefox",
        flags: ["--headless", "-private"]
      }
    },
    /* Default */
    browsers: ["ChromeHeadless"],
    /* Tests on Mac */
    // browsers: ["ChromeHeadless", "FirefoxHeadless", "SafariNative"],
    /* Tests on Mac in private mode */
    // browsers: ["ChromePrivate", "FirefoxPrivate", "SafariPrivate"],
    /* Tests on Windows */
    // browsers: ["Chrome", "Firefox"],
    /* Tests on Windows in private mode */
    // browsers: ["ChromePrivate", "FirefoxPrivate"],
    restartOnFileChange: true
  });
};