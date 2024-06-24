pipeline {
    agent any

    environment {
        NODE_VERSION = '20.13.1'
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
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'cdcdev09인증정보', keyFileVariable: 'SSH_KEY', passphraseVariable: '', usernameVariable: 'SSH_USER')]) {
                        bat """
                            pscp -i %SSH_KEY% -batch -r dist/* %SSH_USER%@192.168.110.115:/project/vue-app/
                        """
                    }
                }
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
