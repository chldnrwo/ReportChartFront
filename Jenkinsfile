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
                bat '''
                    curl -Lo nvm-setup.zip https://github.com/coreybutler/nvm-windows/releases/download/1.1.9/nvm-setup.zip

                    REM Check if the download was successful
                    if not exist nvm-setup.zip (
                        echo "Download failed."
                        exit /b 1
                    )

                    REM Verify the file size is reasonable
                    for %%A in (nvm-setup.zip) do (
                        if %%~zA lss 100000 (
                            echo "Downloaded file is too small, possibly corrupt."
                            del nvm-setup.zip
                            exit /b 1
                        )
                    )

                    REM Extract and install nvm
                    powershell -NoProfile -NonInteractive -Command "Expand-Archive -Path nvm-setup.zip -DestinationPath . -Force"

                    REM Verify that the nvm-setup.exe exists before proceeding
                    if not exist nvm-setup.exe (
                        echo "Extraction failed or nvm-setup.exe not found."
                        exit /b 1
                    )

                    REM Install nvm with timeout
                    powershell -NoProfile -NonInteractive -Command "Start-Process -FilePath .\\nvm-setup.exe -ArgumentList '/S' -Wait; Start-Sleep -Seconds 60"
                    if errorlevel 1 (
                        echo "Installation timed out or failed."
                        exit /b 1
                    )
                    del nvm-setup.zip

                    REM Set environment variables
                    setx PATH "C:\\Program Files\\nodejs;C:\\Users\\%USERNAME%\\AppData\\Roaming\\nvm;%PATH%"
                    powershell -NoProfile -NonInteractive -Command "[System.Environment]::SetEnvironmentVariable('Path', $env:Path, [System.EnvironmentVariableTarget]::Machine)"

                    REM Verify nvm command
                    powershell -NoProfile -NonInteractive -Command "Get-Command nvm"

                    REM Install and use the specified Node.js version
                    powershell -NoProfile -NonInteractive -Command "nvm install ${NODE_VERSION}"
                    powershell -NoProfile -NonInteractive -Command "nvm use ${NODE_VERSION}"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                    npm install
                '''
            }
        }

        stage('Build') {
            steps {
                bat '''
                    npm run build
                '''
            }
        }

        stage('Deploy') {
            steps {
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
