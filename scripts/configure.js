const { configure, question, WRANGLER_CONFIG_PATH, testFile } = require('./shared')

testFile(WRANGLER_CONFIG_PATH).then(
  fileExists => {
    if (fileExists) return question()
  },
).then(
  () => configure(process.argv[2]),
).catch(
  (err) => console.error(err),
).then(
  () => process.exit(0),
)