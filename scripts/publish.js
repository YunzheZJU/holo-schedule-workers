const { configure, publish, WRANGLER_CONFIG_PATH, testFile } = require('./shared')

testFile(WRANGLER_CONFIG_PATH).then(
  fileExists => {
    // Configure if wrangler.toml does not exist
    if (!fileExists) return configure(process.argv[2])
  },
).then(
  () => publish(),
).catch(
  (err) => console.error(err),
).then(
  () => process.exit(0),
)