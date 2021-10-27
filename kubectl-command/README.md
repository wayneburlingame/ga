# Kubectl Command
A GitHub Action to execute kubectl commands.

## Parameters
- *kubeconfig* (required)
- *verison* (optional)

## Example
```yaml
name: first
on:
  push:
    branches:
      - master

jobs:
  create:
    runs-on: [self-hosted, zendesk-stable]
    steps:
      - uses: zendesk/checkout@v2
      - uses: zendesk/ga/kubectl-command@v2
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
          args: apply -f pod.yaml
```
