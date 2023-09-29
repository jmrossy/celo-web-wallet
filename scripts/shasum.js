const crypto = require('crypto')
const fs = require('fs')

const hashSum = crypto.createHash('sha256')
const fileBuffer = fs.readFileSync(process.argv[2])
hashSum.update(fileBuffer)

const hex = hashSum.digest('base64')

console.log(hex)
