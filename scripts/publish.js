const { configure, publish, WRANGLER_CONFIG_PATH, testFile } = require('./shared')

process.chdir(`packages/${process.argv[2]}`)

testFile(WRANGLER_CONFIG_PATH).then(
  fileExists => {
    // Configure if wrangler.toml does not exist
    if (!fileExists) return configure(process.argv[3])
  },
).then(
  () => publish(),
).catch(
  (err) => console.error(err),
).then(
  () => process.exit(0),
)