pipeline {

    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        AWS_REGION = "ap-south-1"
        AWS_ACCOUNT_ID = "226236025590"

        BACKEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/mern-devops-backend"
        FRONTEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/mern-devops-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                echo 'Fetching source code from GitHub'
                checkout scm
            }
        }

        stage('Validate Environment') {
            steps {
                sh '''
                echo "=== Environment Validation ==="

                git --version
                docker --version
                aws --version

                pwd
                ls -la
                '''
            }
        }

        stage('Verify AWS Identity') {
            steps {
                sh '''
                export AWS_PAGER=""
                aws sts get-caller-identity
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                docker build \
                  -t ${BACKEND_REPO}:${IMAGE_TAG} \
                  -t ${BACKEND_REPO}:latest \
                  ./backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                docker build \
                  -t ${FRONTEND_REPO}:${IMAGE_TAG} \
                  -t ${FRONTEND_REPO}:latest \
                  ./frontend
                """
            }
        }

        stage('Verify Local Images') {
            steps {
                sh '''
                docker images | grep mern-devops
                '''
            }
        }

        stage('Login To Amazon ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region ${AWS_REGION} | docker login \
                  --username AWS \
                  --password-stdin \
                  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh """
                docker push ${BACKEND_REPO}:${IMAGE_TAG}
                docker push ${BACKEND_REPO}:latest
                """
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh """
                docker push ${FRONTEND_REPO}:${IMAGE_TAG}
                docker push ${FRONTEND_REPO}:latest
                """
            }
        }

        stage('Verify Images In ECR') {
            steps {
                sh '''
                aws ecr describe-images \
                  --repository-name mern-devops-backend \
                  --region ${AWS_REGION}

                aws ecr describe-images \
                  --repository-name mern-devops-frontend \
                  --region ${AWS_REGION}
                '''
            }
        }

    }   

    post {

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }

        always {
            sh '''
            docker logout || true
            docker image prune -af || true
            '''
            echo 'Pipeline execution finished.'
        }
    }
}
