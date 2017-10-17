import { JSDOM } from 'jsdom'
import FeedSourceProcessor from './FeedSourceProcessor'

export default class CodetenguFeedSourceProcessor extends FeedSourceProcessor {
  static defaultLimit = 3
  static defaultExpandedLimit = 1

  parseSourceAsync = async () => {
    const feedData = await this.getFeedDataAsync()

    if (!this.expand) {
      return feedData
    }

    const issueItems = []

    feedData.items.forEach((feedItem) => {
      const dom = new JSDOM(feedItem.description)
      const bodyChildren = dom.window.document.getElementsByTagName('body')[0].children
      const issueData = Array.from(bodyChildren).reduce((data, element) => {
        if (element.tagName === 'H3') {
          data.push({ name: element.innerHTML, items: [] })
          return data
        }

        const currentSection = data[data.length - 1]

        if (!currentSection) return data

        if (element.tagName === 'H4') {
          const a = element.querySelector('a')
          if (!a) return data
          const title = a.innerHTML
          const link = a.attributes.href && a.attributes.href.value
          currentSection.items.push({
            title,
            link,
            description: '',
          })
          return data
        }

        const currentItem = currentSection.items[currentSection.items.length - 1]

        if (!currentItem) return data

        if (element.tagName !== 'IMG' && element.tagName !== 'HR') {
          const wrap = dom.window.document.createElement('div')
          wrap.appendChild(element.cloneNode(true))
          currentItem.description += wrap.innerHTML
        }

        return data
      }, [])

      let i = 1

      issueData.forEach((section) => {
        section.items.forEach(((item) => {
          issueItems.push({
            title: item.title,
            description: item.description,
            beforeContent: `<blockquote><h5>${section.name}</h5>${item.description}</blockquote><hr />`,
            url: item.link,
            guid: `codetengu-item-${item.link}`,
            curator: section.name,
            date: new Date(feedItem.date - i),
          })
          i++
        }))
      })
    })

    feedData.items = feedData.items.concat(issueItems)

    return feedData
  }
}
