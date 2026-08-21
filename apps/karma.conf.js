// Karma configuration file
module.exports = function (config) {
  // Lê a variável de ambiente injetada pelo script ou pipeline
  const projectName = (process.env.PROJECT_NAME || (new Date().toISOString()).replace(/\D/g, '')) + '_' + (Math.random() * Math.random()).toString(36).replace('.', '').toUpperCase();
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
      clearContext: true,
      jasmine: {}
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    // Esta é a configuração do reporter que o Jenkins vai usar
    junitReporter: {
      outputDir: `test-results/${projectName}`,
      outputFile: 'test-results.xml',
      useBrowserName: true,
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
    reporters: ['progress', 'kjhtml', 'junit'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',               // Desativa o sandbox, crucial para CI no Windows
          '--disable-gpu',              // Evita travamentos de renderização em background
          '--disable-translate',
          '--disable-extensions',
          '--disable-dev-shm-usage',    // Usa /tmp em vez de memória compartilhada (evita crash)
          // '--remote-debugging-port=0',  // Porta dinâmica para debugging interno do Chrome
          // '--remote-debugging-port=9222',
          '--window-size=1920,1080'
        ]
      }
    },
    browsers: ['ChromeHeadlessCI'],
    restartOnFileChange: false
  });
};