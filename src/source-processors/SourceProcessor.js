import s3CacheService from '../services/s3CacheService'

export default class SourceProcessor {
  static defaultLimit = 200
  static defaultExpandedLimit = 5

  constructor(source, { limit, expand } = {}) {
    this.source = source
    this.limit = limit || (expand ? this.constructor.defaultExpandedLimit : this.constructor.defaultLimit)
    this.expand = expand
  }

  parseSourceAsync = async () => {
    const sampleItem = {
      url: 'https://google.com',
      title: 'Google',
      description: 'Don\'t be eval. Leave no stone unturned.',
      guid: 'https://google.com',
      date: null,
      author: null,
      categories: [],
      enclosures: [],
    }

    return {
      title: 'Sample Title',
      description: 'Sample Description',
      items: [sampleItem],
    }
  }

  getCacheKey = () => {
    if (this.cacheKey) {
      return this.cacheKey
    }

    const urlHash = new Buffer(this.source.repeat(5)).toString('base64').substr(0, 64)
    const timestamp = parseInt(Date.now() / (1000 * 60 * 10), 10)
    const key = `sources/${this.constructor.name}${this.expand ? '/expand' : ''}/${urlHash}/${this.limit}/${timestamp}`

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

  getResultAsync = async () => {
    const cachedResult = await this.loadCacheAsync()
    if (cachedResult) {
      return cachedResult
    }

    const result = await this.parseSourceAsync()

    if (result) {
      this.saveCacheAsync(result)
    }

    return result
  }
}
