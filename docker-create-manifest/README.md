# Create multiarch docker manifest

A GitHub Action to create and push image manifest for multiarch images.

Note: This action is designed to work in tandem with the `docker-build-multiarch` action.

It generates multiarch manifest for `amd64` and `arm64` images build by
the `docker-build-multiarch` action.

It will create and push multiarch manifest with name

```
${ input.image-name }:${ github.sha }      # if target-tags == ''
${ input.image-name }:${ github.ref_name } # if target-tags == ''

or

${ input.image-name }:custom-tag           # for each tag in target-tags
```

referencing this list of images:

```
${ input.image-name }:${ github.sha }-amd64
${ input.image-name }:${ github.sha }-arm64
```

## Parameters

| Parameter | | Description |
|--|--|--|
| `image-name` | optional, default `env.IMAGE_NAME` | The full name of the image without tag. |
| `target-tags` | optional, default: `github.sha github.ref_name` | Space separated list of tags to create the manifest with. Tags are automatically replaced with `-` for any unsupported character. |
| `architectures` | optional, default: `amd64 arm64` | Space separated list of architectures to infert the list of source images from. Each architecture will be mapped to `${ input.image-name}:${ github.sha }-<arch>` image in the list. |

## Examples

### Default parameters

Parameters:
* `image-name=my-image-name`

Context:
* `github.sha=abcdef`
* `github.ref_name=my/branch`

It will:
* Create manifest with name `my-image-name:abcdef` and `my-image-name:my-branch`
* With list of `my-image-name:abcdef-amd64` and `my-image-name:abcdef-arm64` images

### Overriden parameters

Parameters:
* `image-name=my-image-name`
* `target-tags=latest production`

Context:
* `github.sha=abcdef`

It will:
* Create manifest with name `my-image-name:latest` and `my-image-name:production`
* With list of `my-image-name:abcdef-amd64` and `my-image-name:abcdef-arm64` images

### Full examples

See examples in [docker-build-multiarch action](../docker-build-multiarch/README.md).
