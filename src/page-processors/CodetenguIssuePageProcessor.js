import PageProcessor from './PageProcessor'

export default class CodetenguIssuePageProcessor extends PageProcessor {
  parsePageAsync = async () => {
    const article = await this.getArticleAsync()

    const contentElement = article.document.getElementsByClassName('issue')[0]
    contentElement.getElementsByTagName('header')[0].remove()

    return {
      // title: undefined,
      // author: undefined,
      // description: undefined,
      // categories: undefined,
      // date: undefined,
      // imageURL: undefined,
      content: contentElement.innerHTML,
    }
  }
}
