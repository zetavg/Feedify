import request from 'request'
import read from 'node-readability'
import url from 'url'
import s3CacheService from '../services/s3CacheService'

export default class PageProcessor {
  constructor(pageURL) {
    this.pageURL = pageURL
  }

  getPageBodyAsync = () => {
    const promise = new Promise((resolve, reject) => {
      if (this.pageBody) {
        resolve(this.pageBody)
        return
      }

      request(this.pageURL, (error, response, body) => {
        if (error) {
          reject(error)
          return null
        }

        this.pageBody = body
        resolve(body)
        return null
      })
    })

    return promise
  }

  getArticleAsync = () => {
    const promise = new Promise((resolve, reject) => {
      this.getPageBodyAsync().then((body) => {
        read(body, (error, article) => {
          if (error) {
            reject(error)
            return null
          }

          resolve(article)
          return null
        })
      }).catch((error) => {
        reject(error)
      })
    })

    return promise
  }

  getCacheKey = () => {
    if (this.cacheKey) {
      return this.cacheKey
    }

    const urlObj = url.parse(this.pageURL)
    const urlHost = urlObj.host
    const urlPath = urlObj.path
    const urlHostHash = new Buffer(urlHost.repeat(10)).toString('base64').substr(0, 32)
    const urlPathHash = new Buffer(urlPath.repeat(10)).toString('base64').substr(0, 128)
    const key = `${urlHostHash}/${urlPathHash}`

    this.cacheKey = key
    return key
  }

  loadCacheAsync = async () => {
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    const data = await s3CacheService.asyncLoadCache(this.getCacheKey())
    return data
  }

  saveCacheAsync = async (data) => {
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    const result = await s3CacheService.asyncSaveCache(this.getCacheKey(), data)
    return result
  }

  parsePageAsync = async () => {
    const article = await this.getArticleAsync()

    return {
      // title: undefined,
      // author: undefined,
      // description: undefined,
      // categories: undefined,
      // date: undefined,
      // imageURL: undefined,
      content: article.content,
    }
  }

  getResultAsync = async () => {
    const cachedResult = await this.loadCacheAsync()
    if (cachedResult) {
      return cachedResult
    }

    const data = await this.parsePageAsync()
    if (data) {
      this.saveCacheAsync(data)
    }
    return data
  }
}
