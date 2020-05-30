# holo-schedule-workers

### Table of contents

1. [Introduction](#introduction)
1. [System dependencies](#system-dependencies)
1. [How to...](#how-to)
    1. [Publish all packages](#publish-all-packages)
    1. [Test all packages](#test-all-packages)

## Introduction

Serverless workers for holo-schedule.

## System Dependencies
* [NodeJS (with npm)](https://nodejs.org/en/)
* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* [Lerna](https://lerna.js.org/)
* [Wrangler](https://developers.cloudflare.com/workers/tooling/wrangler/install)

## How to...

### Configure

### Publish all packages

First edit `publish.json` and specify your worker names there.

```json5
// publish.json
{
  "worker-youtube-livestream": [
    "my-worker-1",
    "my-worker-2"
  ]
}
```

Then run:

```shell script
set CF_ACCOUNT_ID=youraccountid
set CF_API_TOKEN=superlongapitoken
yarn run publish:all
```

This will publish worker `worker-youtube-livestream` to `my-worker-1` and `my-worker-2`.

### Test all packages

```shell script
yarn run test
```