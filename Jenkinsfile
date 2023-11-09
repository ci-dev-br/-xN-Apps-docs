pipeline{
    agent any
    stages{
        stage('Install Client'){
            step{
                bat 'cd client && pnpm i'
            }
        }
        stage('Compilar cliente'){
            step{
                bat 'cd client && node node_modules/@angular/cli/bin/ng build -c production'
            }
        }
    }
}