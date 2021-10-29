# Platform Data Subgraph Integration

This GitHub action provides the common logic that is required to add subgraphs to the federated GraphQL Gateway.

In order to use it, you first need to add a new file in the root directory of your repo, named `platform-data-graph.yml`.
The file must have a content similar to the example below. (To find the `serviceName` and the `serviceNamespace` for the `routingUrl` field, please see these examples for the `guide-external-content-ingestion-service`: [serviceName](https://github.com/zendesk/guide-external-content-ingestion-service/blob/ad729e7defe79fdfa119954b256c6e36bb01a5ec/kubernetes/manifests/staging/pod998/app-server.yml#L554) and [serviceNamespace](https://github.com/zendesk/guide-external-content-ingestion-service/blob/ad729e7defe79fdfa119954b256c6e36bb01a5ec/kubernetes/manifests/staging/pod998/app-server.yml#L555))

```yml
# platform-data-graph.yml

subgraph:
  name: coin-flip
  schemaPath: schema.graphql
  routingUrl: http://coin-flip.coin-flip.svc.cluster.local/graphql  # http://<serviceName>.<serviceNamespace>.svc.cluster.local/graphql
  routingUrlDev: http://coin-flip:3000/graphql                      # Use your service's Host and IP from ZDI
```

Then, add a step to your default workflow, or create a new one with the following content:


```
name: Platform Data Subgraph Integration
on:
  push:
    branches:
      - '**'
    paths:
      - 'schema.graphql'

jobs:
  main:
    runs-on: [self-hosted, zendesk-stable]

    steps:
      - uses: zendesk/checkout@v2

      - name: <Your service name> subgraph schema integration
        uses: zendesk/ga/platform-data-subgraph-integration@v1
        env:
          GITHUB_TOKEN: ${{ secrets.ORG_GITHUB_TOKEN }}
          APOLLO_KEY: ${{ secrets.APOLLO_KEY }}
```

The action will perform the following tasks, though the One-Graph team might introduce other actions in the future.

- Use Apollo Rover CLI to check any change to the subgraph schema. Pull requests will fail if the schema is invalid and cannot be merged.
- Publish the subgraph schema to the @main platform data graph variant on merges to the repository default branch
