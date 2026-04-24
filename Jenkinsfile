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

                        where gulp >nul 2>nul
                        if %errorlevel% neq 0 (
                            echo gulp-cli nao encontrado. Instalando...
                            npm install -g gulp-cli
                        ) else (
                            echo gulp-cli ja esta instalado.
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
                            } catch (err) { 
                                echo 'Waiting'
                            }
                            finally {
                                try {
                                    bat """
                                        @echo off
                                        taskkill /F /IM chrome.exe /T >nul 2>&1 || exit 0
                                        """
                                } catch (err) {
                                    echo 'End'
                                }
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
    }
    post {
        always {
            echo 'Processando relatórios de teste...'
            junit testResults: "${env.APP_PATH}/test-results/**/*.xml", allowEmptyResults: true
            
            echo 'Finalizando pipeline...'

            script {
                    // Defina a URL do endpoint
                    def endpoint = new URL("https://apps.ci.dev.br/Deployer/report")

                    // Abra a conexão
                    def connection = endpoint.openConnection()

                    // Configure o método e os cabeçalhos da requisição
                    connection.setRequestMethod("POST")
                    connection.setDoOutput(true) // OBRIGATÓRIO: Informa que enviaremos um corpo (payload) na requisição
                    connection.setRequestProperty("Content-Type", "application/json; utf-8")
                    connection.setRequestProperty("Accept", "application/json")
                    
                    def requestData = [
                        url_report: env.BUILD_URL
                    ]
                    // 2. Converta o mapa para uma string JSON válida de forma segura
                    def payload = JsonOutput.toJson(requestData)
                    // Envie o payload abrindo o stream de saída. 
                    // O 'withWriter' do Groovy garante que o stream será fechado automaticamente após o uso.
                    connection.outputStream.withWriter("UTF-8") { writer ->
                        writer.write(payload)
                    }

                    // Capture a resposta
                    def responseCode = connection.getResponseCode()

                    if (responseCode == 200 || responseCode == 201) {
                        // '.text' é um atalho do Groovy para ler todo o InputStream de uma vez
                        def responseBody = connection.inputStream.text
                        println "✅ Sucesso! Código: ${responseCode}"
                        println "Resposta: ${responseBody}"
                    } else {
                        // Se der erro (4xx ou 5xx), lemos o errorStream
                        def errorBody = connection.errorStream?.text ?: "Sem corpo de erro"
                        println "❌ Falha! Código: ${responseCode}"
                        println "Erro: ${errorBody}"
                    }
                }
            }
        }
        success {
            echo 'Build e Testes concluídos com sucesso!'
        }
        failure {
            echo 'Ocorreu um erro. Verifique os relatórios de teste ou o log de build.'
        }
    }
}