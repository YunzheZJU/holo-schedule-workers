const { configure, question, publish, WRANGLER_CONFIG_PATH, testFile } = require('./shared')
const workers = require('../workers.json')

const publishAll = async () => {
  const fileExists = await testFile(WRANGLER_CONFIG_PATH)

  if (fileExists) {
    await question()
  }

  for (let worker of workers) {
    console.log(`Publishing to ${worker}...`)
    await configure(worker)
    await publish()
  }
}

publishAll().catch(
  (err) => console.error(err),
).then(
  () => process.exit(0),
)