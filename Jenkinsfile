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
        stage('Build da Aplicação') {
            steps {
                dir("${env.APP_PATH}") {
                    echo 'Iniciando compilação Angular (Produção)...'
                    bat 'npm run build -- --configuration=production'
                }
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