#!/usr/bin/env groovy

pipeline {
    agent { node { label 'default' } }

    environment {
        APP_NAME = 'TEST-APP'
        KUBECONIFG = ''
    }

    stages {
        stage ('Prepare'){
            setFlags()
            checkout scm
        }

        stage('Build Latest Image') {
            when {
                branch 'master'
            }

            steps {
                // Disable the default docker caching if flag is set to true
                if (env.IMAGE_CACHING_ENABLED == true ){
                    echo "Building docker image. [Caching on]"
                    sh 'docker build . -t cognosco41/${env.APP_NAME}:latest'
                } else {
                    echo "Building docker image. [Caching off]"
                    sh 'docker build . -t cognosco41/${env.APP_NAME}:latest --no-cache'
                }
            }
        }


        stage('Publish Lastest Docker Image ') {
            when {
                branch 'master'
            }

            steps {
                withDockerRegistry([ credentialsId: "3a95b00e-eead-4ce1-8390-8c98b7a46545", url: "" ]) {
                    sh 'docker push cognosco41/${env.APP_NAME}:latest'
                }
            }
        }

        stage('Build') {
            steps {
                // Disable the default docker caching if flag is set to true
                if (env.IMAGE_CACHING_ENABLED == true ){
                    echo "Building docker image. [Caching on]"
                    sh 'docker build . -t cognosco41/${env.APP_NAME}:${env.GIT_COMMIT}'
                } else {
                    echo "Building docker image. [Caching off]"
                    sh 'docker build . -t cognosco41/${env.APP_NAME}:${env.GIT_COMMIT} --no-cache'
                }
            }
        }

        stage('Test'){
            steps {
                echo "Running unit tests."
                try {
                    sh 'docker exec -it cognosco41/${env.APP_NAME}:${env.GIT_COMMIT} /bin/bash node test.js'
                } catch(exc) {
                    throw
                }
            }
        }

        stage('Publish Lastest Docker Image ') {
            when {
                branch 'master'
            }

            steps {
                withDockerRegistry([ credentialsId: "3a95b00e-eead-4ce1-8390-8c98b7a46545", url: "" ]) {
                    sh 'docker push cognosco41/${env.APP_NAME}:lastest'
                }
            }
        }

        stage('Publish Docker Image') {
            when {
                branch 'staging'
            }

            steps {
                withDockerRegistry([ credentialsId: "3a95b00e-eead-4ce1-8390-8c98b7a46545", url: "" ]) {
                    sh 'docker push cognosco41/${env.APP_NAME}:${env.GIT_COMMIT}'
                }
            }
        }

        stage('Deploy Staging') {
            when {
                branch 'staging'
            }

            environment {
                NAMESPACE = 'staging'
            }

            steps {
                echo "Running deployment."

                sh 'cd .infra'

                // lint the helm chart
                helmLint('.')


                // deploy chart
                sh '''
                    helm upgrade
                    --kubeconfig=${env.KUBECONFIG}
                    --install ${env.APP_NAME} .
                    --values=staging-values.yaml
                    --set ImageTag=${env.IMAGE_TAG}
                '''
                echo "Application ${env.APP_NAME} successfully deployed. Use helm status ${env.APP_NAME} to check"
            }
        }
    }
}


// lint the helm chart
def helmLint(String chart_dir) {
    // lint helm chart
    sh "helm lint --kubeconfig =${env.KUBECONFIG} ${chart_dir}"
}


// check the git commit message for flag signaling.
def setFlags() {
    env.IMAGE_CACHING_ENABLED = "true"

    // flag: disable.docker.image.caching - committer can overide default docker build caching behavior
    rc = sh (script: "git log -1 | grep -i '\\[disable.docker.image.caching\\]'", returnStatus: true)

    if (rc == 0) {
        env.IMAGE_CACHING_ENABLED = "false"
        echo "disabling docker image caching."
    }
}
