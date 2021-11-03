#!/bin/sh

set -e

mkdir -p ~/.kube
echo $KUBE_CONFIG | base64 -d > ~/.kube/config

aws sts get-caller-identity

export $(printf "AWS_ACCESS_KEY_ID=%s AWS_SECRET_ACCESS_KEY=%s AWS_SESSION_TOKEN=%s" \
                $(aws sts assume-role \
                      --role-arn arn:aws:iam::128863593841:role/deploy-platform-spinnaker-test-user-role \
                      --role-session-name ga-runner-eks \
                      --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" \
                      --output text))

aws sts get-caller-identity

kubectl "$@"
