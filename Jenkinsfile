pipeline {
    agent any

    environment {
        NODE_VERSION = '20.13.1'  // 사용 중인 Node.js 버전에 맞춰 변경
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
                // Node.js를 설치하거나 nvm을 사용하여 설정
                sh '''
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                    nvm alias default ${NODE_VERSION}
                '''
            }
        }
//
        stage('Install Dependencies') {
            steps {
                cache(path: "${CACHE_DIR}", key: "npm-cache-${env.NODE_VERSION}") {
                    // npm install 실행
                    sh '''
                        export NVM_DIR="$HOME/.nvm"
                        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                        npm install
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                // 프로젝트 빌드
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                    npm run build
                '''
            }
        }

        stage('Deploy') {
            steps {
                // 빌드된 파일을 배포 서버로 복사
                sshagent(['ssh-credentials-id']) {
                    sh 'scp -r dist/* root@cdcdev09:/project/vue-app/'
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
