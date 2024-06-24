pipeline {
    agent any

    environment {
        NODE_VERSION = '20.13.1'
        CACHE_DIR = 'node_modules'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/chldnrwo/ReportChartFront.git'
            }
        }

        stage('Install Node.js') {
            steps {
                // Node.js를 설치하거나 nvm-windows를 사용하여 설정
                bat '''
                    curl -o- https://raw.githubusercontent.com/coreybutler/nvm-windows/v1.1.7/install.ps1 | powershell -NoProfile -NonInteractive
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                // npm install 실행
                bat '''
                    npm install
                '''
            }
        }

        stage('Build') {
            steps {
                // 프로젝트 빌드
                bat '''
                    npm run build
                '''
            }
        }

        stage('Deploy') {
            steps {
                // 빌드된 파일을 배포 서버로 복사
                sshagent(['ssh-credentials-id']) {
                    bat 'scp -r dist/* root@cdcdev09:/project/vue-app/'
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
