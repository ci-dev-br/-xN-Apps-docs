pipeline {
    agent any
    environment {
        APP_PATH = 'apps'
        API_PATH = 'serve'
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
                    echo 'Verificando e instalando ferramentas globais...'
                    bat """
                        @echo off
                        where ng >nul 2>nul
                        if %errorlevel% neq 0 (
                            echo Angular CLI nao encontrado. Instalando...
                            npm install -g @angular/cli
                        ) else (
                            echo Angular CLI ja esta instalado.
                        )

                        where pnpm >nul 2>nul
                        if %errorlevel% neq 0 (
                            echo pnpm nao encontrado. Instalando...
                            npm install -g pnpm
                        ) else (
                            echo pnpm ja esta instalado.
                        )
                    """
                    
                    echo 'Instalando dependências do projeto...'
                    bat 'pnpm install'
                }   
            }
        }
        stage('Testes Unitários') {
            steps {
                catchError {
                    dir("${env.APP_PATH}") {
                        script {
                            try {
                                bat """
                                    @echo off
                                    npm test -- --no-watch
                                    """
                            } finally {
                                bat """
                                    @echo off
                                    taskkill /F /IM chrome.exe /T >nul 2>&1 || exit 0
                                    """
                            }
                        }
                    }
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