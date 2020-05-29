# holo-schedule-workers

### Table of contents

1. [Introduction](#introduction)
1. [System dependencies](#system-dependencies)
1. [How to...](#how-to)
    1. [Configure](#configure)
    1. [Start](#start)
    1. [Publish](#publish)
    1. [Publish to multiple workers](#publish-to-multiple-workers)
    1. [Test](#test)

## Introduction

Serverless workers for holo-schedule.

## System Dependencies
* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* [Wrangler](https://developers.cloudflare.com/workers/tooling/wrangler/install)

## How to...

### Configure

Run `configure` to generate a `wrangler.toml` before you start:

```shell script
yarn run configure my-worker
```

### Start

```shell script
# Use $HTTP_PROXY if needed
# set HTTP_PROXY=proxyserver
yarn run start
```

### Publish

Publish your worker to account 'youraccountid' after `configure`:

```shell script
set CF_ACCOUNT_ID=youraccountid
set CF_API_TOKEN=superlongapitoken
yarn run publish
```

If you have not configured, run `publish` with a worker name.
This will run configure for you before publish:
```shell script
yarn run publish my-worker
```

### Publish to multiple workers

First edit `workers.json` and specify your worker names there.

```shell script
cat workers.json
# output:
# [
#   "my-worker-1",
#   "my-worker-2"
# ]
```

Then run:

```shell script
yarn run publish:all
```

This will publish your worker to `my-worker-1` and `my-worker-2`.

### Test

```shell script
yarn run test
```