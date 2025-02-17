const path = require('path')
const isEnvironmentVariableSet = {
  fileUploadBucket: process.env.FILE_UPLOAD_BUCKET !== ''
}

exports.exec = require(path.resolve('helper', 'exec'))
exports.random = require(path.resolve('helper', 'random'))
exports.submissionhandler = require(path.resolve('helper', 'submissionhandler'))
exports.model = require(path.resolve('helper', 'model'))
exports.storage = ''

if (isEnvironmentVariableSet.fileUploadBucket) {
  exports.storage = require(path.resolve('helper', 'storage'))
}
