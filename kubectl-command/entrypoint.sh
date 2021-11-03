#!/bin/sh

set -e

mkdir -p ~/.kube
echo $KUBE_CONFIG | base64 -d > ~/.kube/config

"$@"
