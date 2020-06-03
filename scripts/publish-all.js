const { configure, publish, switchPackage } = require('./shared')

const publishConfig = require('../publish.json')

const publishAll = async () => {
  const packageName = process.argv[2]

  if (!packageName) {
    console.error('Please specify a package name')
    return
  }

  if (!(packageName in publishConfig)) {
    console.log(`Skipping ${packageName} which is absent in publish.json...`)
    return
  }

  switchPackage(packageName)

  // eslint-disable-next-line no-restricted-syntax
  for (const worker of publishConfig[packageName]) {
    console.log(`Publishing ${packageName} to ${worker}...`)
    /* eslint-disable no-await-in-loop */
    await configure(worker)
    await publish()
    /* eslint-enable no-await-in-loop */
  }
}

publishAll()
  .catch(
    err => console.error(err),
  )
  .then(
    () => process.exit(0),
  )
