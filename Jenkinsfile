pipeline {
    agent any

    environment {
        NODE_VERSION = '20.13.1'
        DEPLOY_SERVER = '192.168.110.115' // 목적지 IP 주소
        SSH_USER = 'root'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/chldnrwo/ReportChartFront.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                bat """
                    pscp -pw "your_password" -r dist/* ${SSH_USER}@${DEPLOY_SERVER}:/project/vue-app/
                """
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
