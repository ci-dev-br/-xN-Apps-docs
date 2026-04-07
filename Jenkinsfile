pipeline {
    agent any
    environment {
        APP_PATH = 'apps'
    }
    stages {
        stage('Limpeza Inicial') {
            steps {
                echo 'Limpando workspace...'
                deleteDir()
                checkout scm
            }
        }
        stage('Instalação de Dependências') {
            steps {
                dir("${env.APP_PATH}") {
                    echo 'Instalando dependências...'
                    bat 'npm install -g @angular/cli'
                    bat 'npm install -g pnpm'
                    bat 'pnpm install --no-frozen-lockfile' // Evita erros de lockfile desatualizado
                }
            }
        }
        stage('Testes Unitários') {
            steps {
                dir("${env.APP_PATH}") {
                    echo 'Executando testes...'
                    // O comando abaixo executa o teste uma única vez (--watch=false)
                    // e usa o ChromeHeadless (sem janela)
                    bat 'npm test -- --watch=false --browsers=ChromeHeadless --reporters=progress,junit'
                }
            }
        }
        stage('Build da Aplicação') {
            steps {
                dir("${env.APP_PATH}") {
                    echo 'Iniciando compilação Angular (Produção)...'
                    bat 'npm run build -- --configuration=production --verbose'
                }
            }
        }
        // TODO: implementar estágio de publicação do build para o ambiente indicado
    }
    post {
        always {
            echo 'Processando relatórios de teste...'
            // Coleta os arquivos XML gerados pelo karma-junit-reporter
            // O caminho depende de onde o seu karma.conf.js salva o XML
            junit testResults: "${env.APP_PATH}/test-results/**/*.xml", allowEmptyResults: true
            
            echo 'Finalizando pipeline...'
        }
        success {
            echo 'Build e Testes concluídos com sucesso!'
        }
        failure {
            echo 'Ocorreu um erro. Verifique os relatórios de teste ou o log de build.'
        }
    }
}