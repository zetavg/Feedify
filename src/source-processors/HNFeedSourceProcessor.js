import FeedSourceProcessor from './FeedSourceProcessor'

export default class HNFeedSourceProcessor extends FeedSourceProcessor {
  static defaultLimit = 200

  parseSourceAsync = async () => {
    const feedData = await this.getFeedDataAsync()

    feedData.items = feedData.items.map(item => ({
      ...item,
      guid: `hn-item-${item.guid}`,
      beforeContent: `<blockquote><a href="${item.guid}">Comments on Hacker News</a></blockquote><hr />`,
      afterContent: `<hr /><blockquote><a href="${item.guid}">Comments on Hacker News</a></blockquote>`,
      curator: item.author,
      author: undefined,
    }))

    return feedData
  }
}
