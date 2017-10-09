import request from 'request'
import FeedParser from 'feedparser'
import SourceProcessor from './SourceProcessor'

export default class FeedSourceProcessor extends SourceProcessor {
  getResultAsync = () => (
    new Promise((resolve, reject) => {
      const { source: sourceURL } = this

      const sourceFeedReq = request(sourceURL)
      sourceFeedReq.on('error', () => {
        reject(new Error(`Failed to read source feed: ${sourceURL}`))
      })

      const feedParser = new FeedParser()
      sourceFeedReq.pipe(feedParser)
      feedParser.on('error', () => {
        reject(new Error(`Failed to parse source feed: ${sourceURL}`))
      })

      feedParser.on('readable', () => {
        let { limit } = this
        const items = []

        while (limit > 0) {
          limit--
          const feedItem = feedParser.read()
          if (!feedItem) break
          items.push({
            title: feedItem.title,
            description: feedItem.description,
            url: feedItem.link,
            guid: feedItem.guid || feedItem.link,
            categories: feedItem.categories,
            author: feedItem.author,
            date: feedItem.date || feedItem.pubDate || feedItem.pubdate,
            enclosures: feedItem.enclosures,
          })
        }

        resolve({
          title: feedParser.meta.title,
          description: feedParser.meta.description,
          language: feedParser.meta.language,
          image_url: feedParser.meta.image && feedParser.meta.image.url,
          categories: feedParser.meta.categories,
          copyright: feedParser.meta.copyright,
          link: feedParser.meta.link,
          items,
        })
      })
    })
  )
}
