pipeline {
    agent any

    environment {
        NODE_VERSION = '20.13.1'
        NVM_VERSION = '1.1.9' // 현재 nvm-windows 최신 버전
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/chldnrwo/ReportChartFront.git'
            }
        }

        stage('Install nvm-windows and Node.js') {
            steps {
                // nvm-windows와 Node.js 설치
                bat '''
                    curl -Lo nvm-setup.zip https://github.com/coreybutler/nvm-windows/releases/download/${NVM_VERSION}/nvm-setup.zip
                    powershell -NoProfile -NonInteractive -Command "Expand-Archive nvm-setup.zip -DestinationPath ."
                    powershell -NoProfile -NonInteractive -Command "Start-Process -FilePath .\\nvm-setup.exe -ArgumentList '/S' -Wait"
                    del nvm-setup.zip
                    setx PATH "C:\\Program Files\\nodejs;C:\\Users\\%USERNAME%\\AppData\\Roaming\\nvm;%PATH%"
                    powershell -NoProfile -NonInteractive -Command "[System.Environment]::SetEnvironmentVariable('Path', $env:Path, [System.EnvironmentVariableTarget]::Machine)"
                    powershell -NoProfile -NonInteractive -Command "nvm install ${NODE_VERSION}"
                    powershell -NoProfile -NonInteractive -Command "nvm use ${NODE_VERSION}"
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
