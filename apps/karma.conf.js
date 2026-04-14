// Karma configuration file
module.exports = function (config) {
  config.set({
    basePath: '',
    singleRun: true,
    autoWatch: false,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    // CORREÇÃO 1: JUnit removido daqui. Adicionado o framework do Angular.
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    // CORREÇÃO 2: Garantir que o plugin do Angular está carregado junto com o JUnit
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'), // <-- Importante para o Angular entender os testes
      require('karma-junit-reporter')
    ],
    client: {
      clearContext: false,
      jasmine: {}
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    // Esta é a configuração do reporter que o Jenkins vai usar
    junitReporter: {
      outputDir: 'test-results',
      outputFile: 'test-results.xml',
      useBrowserName: false
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/apps'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    // O junit vive aqui, nos reporters!
    reporters: ['progress', 'kjhtml'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222'
        ]
      }
    },
    browsers: ['ChromeHeadlessCI'],
    restartOnFileChange: false
  });
};