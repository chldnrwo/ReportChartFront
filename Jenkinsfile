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
                    withCredentials([usernamePassword(credentialsId: 'cdcdev09', passwordVariable: 'SSH_PASSWORD', usernameVariable: 'SSH_USER')]) {
                        bat """
                            echo y | plink -batch -hostkey "ssh-ed25519 255 SHA256:1LoBJZmd4BE4yVnKyTnyCouxLvCe+owiYFVxBoGQDtg" -pw %SSH_PASSWORD% %SSH_USER%@192.168.110.115 exit
                            pscp -batch -hostkey "ssh-ed25519 255 SHA256:1LoBJZmd4BE4yVnKyTnyCouxLvCe+owiYFVxBoGQDtg" -pw %SSH_PASSWORD% -r dist/* %SSH_USER%@192.168.110.115:/project/vue-app/
                            plink -batch -hostkey "ssh-ed25519 255 SHA256:1LoBJZmd4BE4yVnKyTnyCouxLvCe+owiYFVxBoGQDtg" -pw %SSH_PASSWORD% %SSH_USER%@192.168.110.115 "cd /project/vue-app && sudo docker build -t my-vue-app . && sudo docker stop vue-app || true && sudo docker rm vue-app || true && sudo docker run -d --name vue-app --network my-network -p 8081:80 my-vue-app"
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
