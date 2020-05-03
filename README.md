# holo-schedule-workers
Serverless workers for holo-schedule.

## How to...

### Start

```shell script
# Use $HTTP_PROXY if needed
# set HTTP_PROXY=proxyserver
yarn run start
```

### Publish

```shell script
set CF_ACCOUNT_ID=youraccountid
set CF_API_TOKEN=superlongapitoken
yarn run publish
```

### Test

```shell script
yarn run test
```