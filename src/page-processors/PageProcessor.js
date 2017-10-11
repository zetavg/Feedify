import request from 'request'
import read from 'node-readability'
import url from 'url'
import config from '../config'
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

  getArticleAsync = () => (
    new Promise((resolve, reject) => {
      this.getPageBodyAsync().then((body) => {
        read(body, (error, article) => {
          if (error) {
            reject(error)
            return
          }

          resolve(article)
        })
      }).catch((error) => {
        reject(error)
      })
    })
  )

  getMercuryArticleAsync = () => (
    new Promise((resolve, reject) => {
      request({
        url: `https://mercury.postlight.com/parser?url=${encodeURI(this.pageURL)}`,
        headers: {
          'x-api-key': config.mercuryAPIKey,
        },
      }, (error, response, body) => {
        if (error) {
          reject(error)
          return
        }

        const result = JSON.parse(body)
        resolve(result)
      })
    })
  )

  getCacheKey = () => {
    if (this.cacheKey) {
      return this.cacheKey
    }

    const urlObj = url.parse(this.pageURL)
    const urlHost = urlObj.host
    const urlPath = urlObj.path
    const urlHostHash = new Buffer(urlHost.repeat(10)).toString('base64').substr(0, 32)
    const urlPathHash = new Buffer(urlPath.repeat(10)).toString('base64').substr(0, 128)
    const key = `pages/${this.constructor.name}/${urlHostHash}/${urlPathHash}`

    this.cacheKey = key
    return key
  }

  loadCacheAsync = async () => {
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    const data = await s3CacheService.loadCacheAsync(this.getCacheKey())
    return data
  }

  saveCacheAsync = async (data) => {
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    const result = await s3CacheService.saveCacheAsync(this.getCacheKey(), data)
    return result
  }

  parsePageAsync = async () => {
    const mercuryResult = {}
    if (config.mercuryAPIKey) {
      const article = await this.getMercuryArticleAsync()
      if (article.content) {
        mercuryResult.content = article.content
        if (article.title) mercuryResult.title = article.title
        if (article.author) mercuryResult.author = article.author
        if (article.lead_image_url) mercuryResult.sampleImageURL = article.lead_image_url

        mercuryResult.processingInfo = {
          parser: 'mercury',
        }
      }
    }

    const article = await this.getArticleAsync()

    const result = {
      // title: undefined,
      // author: undefined,
      // description: undefined,
      // categories: undefined,
      // date: undefined,
      // imageURL: undefined,
      sampleImageURL: mercuryResult.image_url,
      content: article.content,
      processingInfo: {
        parser: 'read',
      },
    }

    if ((mercuryResult.content || '').length < (result.content || '').length) {
      return result
    }

    return mercuryResult
  }

  getResultAsync = async () => {
    const cachedResult = await this.loadCacheAsync()
    if (cachedResult) {
      return cachedResult
    }

    const data = await this.parsePageAsync()

    if (!data.processingInfo) {
      data.processingInfo = {}
    }

    data.processingInfo.processor = this.constructor.name

    if (data) {
      this.saveCacheAsync(data)
    }
    return data
  }
}
