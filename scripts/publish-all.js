const { configure, publish } = require('./shared')

const publishConfig = require('../publish.json')

const publishAll = async () => {
  const packages = process.argv[2] ? [process.argv[2]] : Object.keys(publishConfig)

  for (let packageName of packages) {
    process.chdir(`packages/${packageName}`)

    for (let worker of publishConfig[packageName]) {
      console.log(`Publishing ${packageName} to ${worker}...`)
      await configure(worker)
      await publish()
    }
  }
}

publishAll().catch(
  (err) => console.error(err),
).then(
  () => process.exit(0),
)