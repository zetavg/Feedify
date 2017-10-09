import request from 'request'
import FeedParser from 'feedparser'
import SourceProcessor from './SourceProcessor'

/* eslint func-names: "off", prefer-arrow-callback: "off" */

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

      let { limit } = this
      let result = { items: [] }

      feedParser.on('error', () => {
        reject(new Error(`Failed to parse source feed: ${sourceURL}`))
      }).on('meta', function (meta) {
        result = {
          ...result,
          title: meta.title,
          description: meta.description,
          language: meta.language,
          image_url: meta.image && meta.image.url,
          categories: meta.categories,
          copyright: meta.copyright,
          link: meta.link,
        }
      }).on('readable', function () {
        let feedItem

        /* eslint no-cond-assign: "off" */
        while (feedItem = this.read()) {
          limit--
          if (limit < 0) break
          result.items.push({
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
      }).on('end', function () {
        resolve(result)
      })
    })
  )
}
