import config from '../config'

let AWS
let s3

const autoInit = () => {
  if (AWS && s3) {
    return true
  }

  if (!config.bucketName) {
    return false
  }

  AWS = require('aws-sdk')
  s3 = new AWS.S3()

  return true
}

const asyncLoadCache = (cacheKey, { force = false } = {}) => {
  const initialized = autoInit()
  const { bucketName } = config
  return new Promise((resolve, reject) => {
    if (!initialized) {
      resolve(null)
    }
    if (!bucketName) {
      resolve(null)
    }

    s3.getObject({
      Bucket: bucketName,
      Key: `cache/${cacheKey}`,
    }, (error, data) => {
      if (error) {
        if (force) {
          reject(error)
        } else {
          resolve(null)
        }
      }

      if (data && data.Body) {
        try {
          const dataObj = JSON.parse(data.Body.toString('utf8'))
          resolve(dataObj)
        } catch (e) {
          if (force) {
            reject(e)
          } else {
            resolve(null)
          }
        }
      } else {
        resolve(null)
      }
    })
  })
}

const asyncSaveCache = (cacheKey, data) => {
  const initialized = autoInit()
  const { bucketName } = config
  return new Promise((resolve, reject) => {
    if (!initialized) {
      resolve(null)
    }
    if (!bucketName) {
      resolve(null)
    }

    s3.putObject({
      Body: JSON.stringify(data),
      Bucket: bucketName,
      Key: `cache/${cacheKey}`,
    }, (error, responseData) => {
      if (error) {
        reject(error)
      }

      resolve(responseData)
    })
  })
}

const s3CacheService = {
  asyncLoadCache,
  asyncSaveCache,
}

export default s3CacheService
