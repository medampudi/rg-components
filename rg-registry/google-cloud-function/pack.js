const path = require('path')
const crypto = require('crypto')
const fs = require('fs-extra')
const os = require('os')
const archiver = require('archiver')
const BbPromise = require('bluebird')

try {
  const fsp = BbPromise.promisifyAll(fs)

  module.exports = async (packagePath, tempPath) => {
    // Set defaults
    tempPath = tempPath || os.tmpdir()

    /*
    * Ensure id includes datetime and unique string,
    * since packaging can happen in parallel
    */

    let outputFileName = crypto.randomBytes(3).toString('hex')
    outputFileName = `${String(Date.now())}-${outputFileName}.zip`
    const outputFilePath = path.join(tempPath, outputFileName)

    // return the full path for the archived file
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputFilePath)
      const archive = archiver('zip', {
        zlib: { level: 9 }
      })

      output.on('open', () => {
        archive.pipe(output)
        archive.directory(packagePath, false)
        archive.finalize()
      })
      archive.on('error', (err) => reject(err))
      output.on('close', () => resolve([outputFileName, outputFilePath]))
    })
  }
} catch (e) {
  console.log(`Error in zipping source code.`)
}
