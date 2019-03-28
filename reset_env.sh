#!/bin/bash

APP_NAME=TEST_APP
KUBECONFIG=""
IMAGE_TAG=latest

# reset to master
git branch -f staging  master

helm upgrade --kubeconfig=$KUBECONFIG --install $APP_NAME .  --values=staging-values.yaml --set ImageTag=$IMAGE_TAG
