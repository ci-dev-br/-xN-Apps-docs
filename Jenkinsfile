pipeline {
  agent any 
  stages {
    stage('Install client dependencies') {
      steps {
        bat'cd client/ && npm install'        
      }
    }
    stage('build client') {
      steps {
        bat'cd client/ && node ./node_modules/@angular/cli/bin/ng build -c production'
      }
    }
    stage('install serve dependencies') {
      steps {
        bat'cd server/ && npm install'        
      }
    }
    stage('build serve') {
      steps {
        bat'cd server/ && node node_modules/@nestjs/cli/nest build'        
      }
    }
  }
}