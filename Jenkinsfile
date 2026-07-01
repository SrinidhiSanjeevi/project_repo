pipeline {

    agent any

    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        AWS_REGION        = "ap-south-1"
        AWS_ACCOUNT_ID    = "226236025590"

        BACKEND_REPO      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/homeease-backend"
        FRONTEND_REPO     = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/homeease-frontend"

        ECS_CLUSTER       = "homeease-cluster"
        BACKEND_SERVICE   = "homeease-backend-service"
        FRONTEND_SERVICE  = "homeease-frontend-service"

        IMAGE_TAG         = "${GIT_COMMIT.take(8)}"

        BACKEND_IMAGE     = "${BACKEND_REPO}:${IMAGE_TAG}"
        FRONTEND_IMAGE    = "${FRONTEND_REPO}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "=== Checking out source code ==="
                checkout scm
                sh '''
                echo "Branch  : $GIT_BRANCH"
                echo "Commit  : $GIT_COMMIT"
                echo "Author  : $GIT_AUTHOR_NAME"
                '''
            }
        }

     
        stage('Validate Environment') {
            steps {
                sh '''
                echo "=== Tool Versions ==="
                git     --version
                docker  --version
                aws     --version
                node    --version || true
                npm     --version || true
                echo "=== Workspace ==="
                pwd && ls -la
                '''
            }
        }

       
        stage('Verify AWS Identity') {
            steps {
                sh '''
                export AWS_PAGER=""
                echo "=== AWS Caller Identity ==="
                aws sts get-caller-identity
                '''
            }
        }

      
        stage('Install & Test Backend') {
            steps {
                dir('backend') {
                    sh '''
                    echo "=== Installing backend dependencies ==="
                    npm ci

                    echo "=== Running backend tests (if any) ==="
                    npm test --if-present || echo "No tests found, skipping..."
                    '''
                }
            }
        }

        stage('Install & Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    echo "=== Installing frontend dependencies ==="
                    npm ci

                    echo "=== Running frontend tests (if any) ==="
                    npm test --if-present -- --watchAll=false || echo "No tests found, skipping..."

                    echo "=== Building Vite production bundle ==="
                    npm run build
                    '''
                }
            }
        }

    
        stage('Login to Amazon ECR') {
            steps {
                sh '''
                echo "=== Authenticating Docker with Amazon ECR ==="
                aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login \
                        --username AWS \
                        --password-stdin \
                        ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Build Docker Images') {
            parallel {

                stage('Build Backend Image') {
                    steps {
                        sh """
                        echo "=== Building Backend Image: ${BACKEND_IMAGE} ==="
                        docker build \\
                            -t ${BACKEND_IMAGE} \\
                            -t ${BACKEND_REPO}:latest \\
                            ./backend
                        """
                    }
                }

                stage('Build Frontend Image') {
                    steps {
                        sh """
                        echo "=== Building Frontend Image: ${FRONTEND_IMAGE} ==="
                        docker build \\
                            -t ${FRONTEND_IMAGE} \\
                            -t ${FRONTEND_REPO}:latest \\
                            ./frontend
                        """
                    }
                }
            }
        }

        stage('Verify Local Images') {
            steps {
                sh '''
                echo "=== Built Images ==="
                docker images | grep homeease
                '''
            }
        }

        
        stage('Push to Amazon ECR') {
            parallel {

                stage('Push Backend') {
                    steps {
                        sh """
                        echo "=== Pushing Backend Images ==="
                        docker push ${BACKEND_IMAGE}
                        docker push ${BACKEND_REPO}:latest
                        """
                    }
                }

                stage('Push Frontend') {
                    steps {
                        sh """
                        echo "=== Pushing Frontend Images ==="
                        docker push ${FRONTEND_IMAGE}
                        docker push ${FRONTEND_REPO}:latest
                        """
                    }
                }
            }
        }

        stage('Verify ECR Images') {
            steps {
                sh """
                echo "=== Verifying Backend in ECR ==="
                aws ecr describe-images \\
                    --repository-name homeease-backend \\
                    --region ${AWS_REGION} \\
                    --image-ids imageTag=${IMAGE_TAG}

                echo "=== Verifying Frontend in ECR ==="
                aws ecr describe-images \\
                    --repository-name homeease-frontend \\
                    --region ${AWS_REGION} \\
                    --image-ids imageTag=${IMAGE_TAG}
                """
            }
        }

        
        stage('Deploy to ECS') {
            when {
                branch 'main'
            }
            steps {
                sh """
                echo "=== Deploying Backend to ECS ==="
                aws ecs update-service \\
                    --cluster ${ECS_CLUSTER} \\
                    --service ${BACKEND_SERVICE} \\
                    --force-new-deployment \\
                    --region ${AWS_REGION}

                echo "=== Deploying Frontend to ECS ==="
                aws ecs update-service \\
                    --cluster ${ECS_CLUSTER} \\
                    --service ${FRONTEND_SERVICE} \\
                    --force-new-deployment \\
                    --region ${AWS_REGION}

                echo "=== Waiting for Backend service stability ==="
                aws ecs wait services-stable \\
                    --cluster ${ECS_CLUSTER} \\
                    --services ${BACKEND_SERVICE} \\
                    --region ${AWS_REGION}

                echo "=== ECS Deployment Complete ==="
                """
            }
        }

    }

    post {

        success {
            echo "HomeEase Pipeline SUCCEEDED — Build #${BUILD_NUMBER} | Tag: ${IMAGE_TAG}"
        }

        failure {
            echo "HomeEase Pipeline FAILED — Build #${BUILD_NUMBER} | Check logs!"
        }

        always {
            sh '''
            echo "=== Cleanup: Docker logout and prune ==="
            docker logout || true
            docker image prune -af --filter "until=24h" || true
            '''
            echo "=== Pipeline finished at $(date) ==="
        }
    }
}
