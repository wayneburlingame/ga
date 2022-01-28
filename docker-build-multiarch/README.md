# Multiarch Docker image build

A GitHub Action to build docker image with support for emulated cross platform build.

Note: This action is designed to work in tandem with the `docker-create-manifest` action. Hence
this action always creates single tag, multiple tags then can be created with the `docker-create-manifest`
action.

It builds and pushes image in this format:

```
${ inputs.image-name }:${ github.sha }-${ inputs.architecture }
```

Note: This action intentionally allows building only single architecture at the time, even when `buildx`
supports parallel building of multiple architectures in one command. This is to prefer to use
`matrix` strategy to parallelize the builds for each architecture. In the future each architecture
may also use own host runner, this will allow to use it.

## Parameters

| Parameter | | Description |
|--|--|--|
| `architecture` | required | Architecture to build image for without the os prefix (only linux). E.g. `amd64`, `arm64` |
| `working-directory` | optiona, default `.` | Build in different working directory than the root of the repository |
| `image-name` | optional, default `env.IMAGE_NAME` | The full name of the image without tag. |
| `docker-args` | optional, default: `''` | additional arguments to the docker build command. Can be used to add `--build-args`, `--cache-from`, etc. Note that `buildx` automatically pull images when using `--cache-from`. |
| `push` | optional, default: `true` | whether to push the build images or not. Accepts string of `"true"` or `"false"`. |
| `dockerfile` | optional, default: `Dockerfile` | path to Dockerfile to use |
| `add-revision-label` | optional, default: `true` | whether to add the revision label with current sha to the image |

## Basic example

Basic example of building single image for both amd64 and arm64 archs, and using the `docker-create-manifest` to create the resulting tags

```yaml
name: "Docker Image Build"

on: push

env:
  IMAGE_NAME: gcr.io/my-app

jobs:
  build_image:
    name: "Build Image"
    runs-on: [self-hosted, zendesk-stable]
    strategy:
      matrix:
        architecture: ["amd64", "arm64"]
    steps:
      - uses: zendesk/checkout@v2
      - name: Build and push image
        uses: zendesk/ga/docker-build-multiarch@v2
        with:
          docker-args: "--build-arg ARTIFACTORY_USERNAME=${{ secrets.ARTIFACTORY_USERNAME }} --build-arg ARTIFACTORY_API_KEY=${{ secrets.ARTIFACTORY_API_KEY }}"
          architecture: ${{ matrix.architecture }}

  create_manifest:
    name: "Push multiarch manifest"
    runs-on: [self-hosted, zendesk-stable]
    needs: build_image

    steps:
      - uses: zendesk/ga/docker-create-manifest
      - uses: zendesk/ga/docker-create-manifest
        if: github.ref_name == 'master'
        with:
          target-tags: "latest production"
```

## Multiple Dockerfiles example

Building multiple dockerfiles is possible by running one `zendesk/ga/docker-build-multiarch` actions
for each of the Dockerfiles and using the `image-name` input to control the resulting images names.

```yaml
name: "Docker Image Build"

on: push

env:
  IMAGE_NAME: gcr.io/my-app

jobs:
  build_image:
    name: "Build Image"
    runs-on: [self-hosted, zendesk-stable]
    strategy:
      matrix:
        architecture: ["amd64", "arm64"]
    steps:
      - uses: zendesk/checkout@v2
      - name: Build production image
        uses: zendesk/ga/docker-build-multiarch@v2
        with:
          docker-args: "--build-arg ARTIFACTORY_USERNAME=${{ secrets.ARTIFACTORY_USERNAME }} --build-arg ARTIFACTORY_API_KEY=${{ secrets.ARTIFACTORY_API_KEY }}"
          architecture: ${{ matrix.architecture }}
      - name: Build console image
        uses: zendesk/ga/docker-build-multiarch@v2
        with:
          docker-args: "--build-arg ARTIFACTORY_USERNAME=${{ secrets.ARTIFACTORY_USERNAME }} --build-arg ARTIFACTORY_API_KEY=${{ secrets.ARTIFACTORY_API_KEY }}"
          architecture: ${{ matrix.architecture }}
          dockerfile: "Dockerfile.console"
          image-name: gcr.io/my-app-console

  create_manifest:
    name: "Push multiarch manifest"
    runs-on: [self-hosted, zendesk-stable]
    needs: build_image

    steps:
      - uses: zendesk/ga/docker-create-manifest@v2
      - uses: zendesk/ga/docker-create-manifest@v2
        if: github.ref_name == 'master'
        with:
          target-tags: "latest production"

      - uses: zendesk/ga/docker-create-manifest@v2
        with:
          image-name: gcr.io/my-app-console
      - uses: zendesk/ga/docker-create-manifest@v2
        if: github.ref_name == 'master'
        with:
          image-name: gcr.io/my-app-console

```
