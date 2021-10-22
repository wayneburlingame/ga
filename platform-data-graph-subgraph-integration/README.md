# Platform Data Subgraph Integration

This GitHub action provides the common logic that is required to add subgraphs to the federated GraphQL Gateway.

In order to use it, add a step to your default workflow, create a new one with the following content:

```
name: Platform Data Subgraph Integration
on: [push, pull_request]

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
          SUBGRAPH_NAME: <your service subgraph name>
          SUBGRAPH_ROUTING_URL: <your service subgraph routing url>
          SUBGRAPH_SCHEMA_PATH: <path to your>/federated-schema.graphql
```

The action will perform the following tasks, though the One-Graph team might introduce other actions in the future.

- Use Apollo Rover CLI to check any change to the subgraph schema. Pull requests will fail if the schema is invalid and cannot be merged.
- Publish the subgraph schema to the @main platform data graph variant on merges to the repository default branch
