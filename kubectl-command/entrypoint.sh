#!/bin/sh

set -e

mkdir -p ~/.kube
echo $KUBE_CONFIG | base64 -d > ~/.kube/config

aws sts get-caller-identity

aws sts assume-role --role-arn arn:aws:iam::128863593841:role/deploy-platform-spinnaker-test-user-role

aws sts get-caller-identity

kubectl "$@"
