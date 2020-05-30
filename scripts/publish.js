const {
  configure, publish, WRANGLER_CONFIG_PATH, switchPackage, testFile,
} = require('./shared')

switchPackage(process.argv[2])

testFile(WRANGLER_CONFIG_PATH)
  .then(
    // Configure if wrangler.toml does not exist
    fileExists => (fileExists ? undefined : configure(process.argv[3])),
  )
  .then(
    () => publish(),
  )
  .catch(
    err => console.error(err),
  )
  .then(
    () => process.exit(0),
  )
