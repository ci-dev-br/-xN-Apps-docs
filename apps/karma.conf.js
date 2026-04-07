// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    singleRun: true,
    autoWatch: false,             // Garante que não vai ficar olhando arquivos
    browserDisconnectTimeout: 10000, // Se o Chrome demorar pra fechar, chuta ele
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    frameworks: ['jasmine', 'junit'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-junit-reporter') // <--- Linha crucial
    ],
    client: {
      clearContext: false,
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    junitReporter: {
      outputDir: 'test-results', // pasta que o Jenkins vai ler
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
    reporters: ['progress', 'kjhtml', 'junit'],
    // browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage', // Evita travamento por falta de memória em CIs
          '--remote-debugging-port=9222'
        ]
      }
    },
    browsers: ['ChromeHeadlessCI'], // Use o launcher customizado aqui
    restartOnFileChange: false
  });
};
