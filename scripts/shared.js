const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { spawn } = require('child_process')

const fsPromises = fs.promises

const WRANGLER_CONFIG_PATH = 'wrangler.toml'

const getWranglerConfig = workerName => `name = "${workerName || 'worker'}"
type = "webpack"
workers_dev = true
`

// @Deprecated
const question = () => new Promise((resolve, reject) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question(`File already exists! ${
    path.join(process.cwd(), WRANGLER_CONFIG_PATH)
  } will be overwritten.
Continue? [Y/N]
`, answer => {
    if (answer.toUpperCase() !== 'Y') {
      reject(new Error('Aborted'))
    }

    rl.close()
    resolve()
  })
})

const testFile = file => fsPromises
  .access(file)
  .then(() => true)
  .catch(err => {
    if (err.code === 'ENOENT') {
      return false
    }
    console.error(`No access to ${WRANGLER_CONFIG_PATH}`)
    throw err
  })

const configure = async workerName => fsPromises
  .writeFile(WRANGLER_CONFIG_PATH, getWranglerConfig(workerName))

// TODO: Retry
const publish = () => new Promise(
  (resolve, reject) => {
    const wrangler = spawn('wrangler', ['publish'], { shell: true })

    wrangler.stdout.on('data', data => {
      console.log(`[wrangler]${data}`)
    })

    wrangler.stderr.on('data', data => {
      console.error(`[wrangler]${data}`)
    })

    wrangler.on('close', code => {
      const message = `[wrangler] Exited with code ${code}`
      if (code === 0) {
        console.log(message)
        resolve()
      } else {
        reject(new Error(message))
      }
    })

    wrangler.on('error', err => {
      console.error('Failed to start sub process wrangler.')
      reject(err)
    })
  },
)

const switchPackage = packageName => process.chdir(
  path.join(__dirname, '..', 'packages', packageName),
)

module.exports = {
  configure,
  WRANGLER_CONFIG_PATH,
  publish,
  question,
  switchPackage,
  testFile,
}
