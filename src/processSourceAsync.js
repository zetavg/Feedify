import FeedSourceProcessor from './source-processors/FeedSourceProcessor'
import HNFeedSourceProcessor from './source-processors/HNFeedSourceProcessor'
import PostgresWeeklyFeedSourceProcessor from './source-processors/PostgresWeeklyFeedSourceProcessor'
import CodetenguFeedSourceProcessor from './source-processors/CodetenguFeedSourceProcessor'

export class UnknownSourceTypeError extends Error {
  constructor(sourceType) {
    super(`Unknown source type: '${sourceType}'.`)
  }
}

const processSourceAsync = async (sourceType, source, { limit, expand }) => {
  let processor

  switch (sourceType) {
    case 'feed':
      if (
        source.match(/^https?:\/\/hnrss\.org/)
      ) {
        processor = new HNFeedSourceProcessor(source, { limit, expand })
      } else if (
        source.match(/^https?:\/\/weekly\.codetengu\.com\/issues\.rss/)
      ) {
        processor = new CodetenguFeedSourceProcessor(source, { limit, expand })
      } else if (
        source.match(/^https?:\/\/postgresweekly\.com\/rss\//)
      ) {
        processor = new PostgresWeeklyFeedSourceProcessor(source, { limit, expand })
      } else {
        processor = new FeedSourceProcessor(source, { limit, expand })
      }
      break
    default:
      throw new UnknownSourceTypeError(sourceType)
  }

  const result = await processor.getResultAsync()
  return result
}

export default processSourceAsync
