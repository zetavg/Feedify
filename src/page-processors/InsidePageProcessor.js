import PageProcessor from './PageProcessor'

export default class InsidePageProcessor extends PageProcessor {
  parsePageAsync = async () => {
    const article = await this.getArticleAsync()

    const contentNode = article.document.getElementsByClassName('post_content')[0]
    const noscriptTag = contentNode.getElementsByTagName('noscript')[0]

    if (noscriptTag) {
      noscriptTag.remove()
    }

    return {
      // title: undefined,
      // author: undefined,
      // description: undefined,
      // categories: undefined,
      // date: undefined,
      // imageURL: undefined,
      content: contentNode.innerHTML,
    }
  }
}
