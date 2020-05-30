const { configure } = require('./shared')

process.chdir(`packages/${process.argv[2]}`)

configure(process.argv[3]).catch(
  (err) => console.error(err),
).then(
  () => process.exit(0),
)