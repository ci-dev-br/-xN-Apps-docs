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
                    bat 'npm install -g pnpm'
                    bat 'pnpm install'
                }
            }
        }
        stage('Lint & Testes') {
            steps {
                dir("${env.APP_PATH}") {
                    echo 'Executando Lint...'
                    sh 'npm run lint'
                    // echo 'Executando Testes...'
                    // sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                }
            }
        }
        stage('Build da Aplicação') {
            steps {
                dir("${env.APP_PATH}") {
                    echo 'Iniciando compilação Angular (Produção)...'
                    sh 'npm run build -- --configuration=production'
                }
            }
        }
        stage('Arquivamento') {
            steps {
                echo 'Arquivando artefatos de build...'
                // Ajuste o caminho 'dist' conforme a saída configurada no seu angular.json
                archiveArtifacts artifacts: "${env.APP_PATH}/dist/**", fingerprint: true
            }
        }
    }
    post {
        always {
            echo 'Finalizando pipeline...'
        }
        success {
            echo 'Build concluído com sucesso!'
        }
        failure {
            echo 'Ocorreu um erro no pipeline. Verifique os logs.'
        }
    }
}