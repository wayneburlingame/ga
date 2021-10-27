#!/bin/sh

set -e

mkdir -p ~/.kube
echo $KUBECONFIG | base64 -d > ~/.kube/config

kubectl "$*"
